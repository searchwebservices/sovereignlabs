import { geolocation } from "@vercel/functions";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  stepCountIs,
  streamText,
} from "ai";
import { after } from "next/server";
import { createResumableStreamContext } from "resumable-stream";
import { getSession } from "@/lib/supabase/server";
import { entitlements } from "@/lib/ai/entitlements";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import { getLanguageModel } from "@/lib/ai/providers";
import { createDocument } from "@/lib/ai/tools/create-document";
import { getLabDashboard } from "@/lib/ai/tools/get-lab-dashboard";
import { manageDevice } from "@/lib/ai/tools/manage-device";
import { manageInitiative } from "@/lib/ai/tools/manage-initiative";
import { managePart } from "@/lib/ai/tools/manage-part";
import { queryLabData } from "@/lib/ai/tools/query-lab-data";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { AI_ASSISTANT_MEMBER_ID, isProductionEnvironment } from "@/lib/constants";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  updateChatTitleById,
  updateMessage,
} from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import { serverTaskMentionsApi } from "@/lib/supabase/server-api";
import type { ChatMessage } from "@/lib/types";
import type { TaskMentionStatus, TaskMentionWithMember } from "@/lib/types/lab";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 60;
const AI_ASSIGNMENT_STATUS_FILTER: TaskMentionStatus[] = ["new", "seen"];
const AI_ASSIGNMENT_LIMIT = 5;

function getStreamContext() {
  try {
    return createResumableStreamContext({ waitUntil: after });
  } catch (_) {
    return null;
  }
}

export { getStreamContext };

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}...`;
}

function getDueDateSortValue(dueDate: string | null | undefined): number {
  if (!dueDate) return Number.POSITIVE_INFINITY;
  const normalizedDueDate = dueDate.slice(0, 10);
  const [year, month, day] = normalizedDueDate.split("-").map(Number);
  if (!year || !month || !day) return Number.POSITIVE_INFINITY;
  return Date.UTC(year, month - 1, day);
}

function getDueDateSummary(dueDate: string | null | undefined): string {
  if (!dueDate) return "none";

  const normalizedDueDate = dueDate.slice(0, 10);
  const dueUtc = getDueDateSortValue(normalizedDueDate);
  if (!Number.isFinite(dueUtc)) return dueDate;

  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const diffDays = Math.floor((dueUtc - todayUtc) / 86_400_000);

  if (diffDays < 0) {
    return `${normalizedDueDate} (overdue ${Math.abs(diffDays)}d)`;
  }
  if (diffDays === 0) return `${normalizedDueDate} (today)`;
  if (diffDays === 1) return `${normalizedDueDate} (tomorrow)`;
  return `${normalizedDueDate} (in ${diffDays}d)`;
}

function prioritizeAiMentions(
  mentions: TaskMentionWithMember[]
): TaskMentionWithMember[] {
  return [...mentions].sort((a, b) => {
    const statusRankA = a.status === "new" ? 0 : 1;
    const statusRankB = b.status === "new" ? 0 : 1;
    if (statusRankA !== statusRankB) return statusRankA - statusRankB;

    const dueDateA = getDueDateSortValue(a.task?.due_date);
    const dueDateB = getDueDateSortValue(b.task?.due_date);
    if (dueDateA !== dueDateB) return dueDateA - dueDateB;

    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });
}

function buildAiAssignmentContextPrompt(
  mentions: TaskMentionWithMember[]
): string | null {
  if (mentions.length === 0) return null;

  const items = mentions.slice(0, AI_ASSIGNMENT_LIMIT).map((mention, index) => {
    const taskTitle = truncate(mention.task?.title || "Untitled task", 100);
    const taskStatus = mention.task?.status || "unknown";
    const priority = mention.task?.priority || "unknown";
    const dueDate = getDueDateSummary(mention.task?.due_date);
    const context = mention.context ? truncate(mention.context, 160) : "none";

    return `${index + 1}. ${taskTitle} | mention=${mention.status} | task=${taskStatus} | priority=${priority} | due=${dueDate} | instruction=${context}`;
  });

  return [
    "AI Assignment Inbox (internal operational context):",
    "- You were explicitly tagged on these tasks.",
    "- Treat these as assignments when relevant to the user's request.",
    "- Do not claim completion unless task state is updated via tools/user action.",
    ...items,
  ].join("\n");
}

async function getAiAssignmentContext() {
  try {
    const mentions = await serverTaskMentionsApi.getByMember(
      AI_ASSISTANT_MEMBER_ID,
      AI_ASSIGNMENT_STATUS_FILTER
    );
    const prioritized = prioritizeAiMentions(mentions);
    const contextPrompt = buildAiAssignmentContextPrompt(prioritized);
    const mentionIdsToMarkSeen = prioritized
      .filter((mention) => mention.status === "new")
      .slice(0, AI_ASSIGNMENT_LIMIT)
      .map((mention) => mention.id);

    return {
      contextPrompt,
      mentionIdsToMarkSeen,
    };
  } catch (error) {
    console.error("Failed to load AI assignment context:", error);
    return {
      contextPrompt: null,
      mentionIdsToMarkSeen: [] as string[],
    };
  }
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const { id, message, messages, selectedChatModel, selectedVisibilityType } =
      requestBody;

    const session = await getSession();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlements.maxMessagesPerDay) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    const isToolApprovalFlow = Boolean(messages);

    const chat = await getChatById({ id });
    let messagesFromDb: DBMessage[] = [];
    let titlePromise: Promise<string> | null = null;

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
      if (!isToolApprovalFlow) {
        messagesFromDb = await getMessagesByChatId({ id });
      }
    } else if (message?.role === "user") {
      await saveChat({
        id,
        userId: session.user.id,
        title: "New chat",
        visibility: selectedVisibilityType,
      });
      titlePromise = generateTitleFromUserMessage({ message });
    }

    const uiMessages = isToolApprovalFlow
      ? (messages as ChatMessage[])
      : [...convertToUIMessages(messagesFromDb), message as ChatMessage];

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    if (message?.role === "user") {
      await saveMessages({
        messages: [
          {
            chatId: id,
            id: message.id,
            role: "user",
            parts: message.parts,
            attachments: [],
            createdAt: new Date(),
          },
        ],
      });
    }

    const isReasoningModel =
      selectedChatModel.includes("reasoning") ||
      selectedChatModel.includes("thinking");

    const modelMessages = await convertToModelMessages(uiMessages);
    const { contextPrompt: aiAssignmentContext, mentionIdsToMarkSeen } =
      await getAiAssignmentContext();
    const baseSystemPrompt = systemPrompt({ selectedChatModel, requestHints });
    const fullSystemPrompt = aiAssignmentContext
      ? `${baseSystemPrompt}\n\n${aiAssignmentContext}`
      : baseSystemPrompt;

    const stream = createUIMessageStream({
      originalMessages: isToolApprovalFlow ? uiMessages : undefined,
      execute: async ({ writer: dataStream }) => {
        const result = streamText({
          model: getLanguageModel(selectedChatModel),
          system: fullSystemPrompt,
          messages: modelMessages,
          stopWhen: stepCountIs(5),
          experimental_activeTools: isReasoningModel
            ? []
            : [
                "queryLabData",
                "manageDevice",
                "managePart",
                "manageInitiative",
                "getLabDashboard",
                "createDocument",
                "updateDocument",
                "requestSuggestions",
              ],
          providerOptions: isReasoningModel
            ? {
                anthropic: {
                  thinking: { type: "enabled", budgetTokens: 10_000 },
                },
              }
            : undefined,
          tools: {
            queryLabData,
            manageDevice,
            managePart,
            manageInitiative,
            getLabDashboard,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({ session, dataStream }),
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
          },
        });

        dataStream.merge(result.toUIMessageStream({ sendReasoning: true }));

        if (titlePromise) {
          const title = await titlePromise;
          dataStream.write({ type: "data-chat-title", data: title });
          updateChatTitleById({ chatId: id, title });
        }
      },
      generateId: generateUUID,
      onFinish: async ({ messages: finishedMessages }) => {
        if (isToolApprovalFlow) {
          for (const finishedMsg of finishedMessages) {
            const existingMsg = uiMessages.find((m) => m.id === finishedMsg.id);
            if (existingMsg) {
              await updateMessage({
                id: finishedMsg.id,
                parts: finishedMsg.parts,
              });
            } else {
              await saveMessages({
                messages: [
                  {
                    id: finishedMsg.id,
                    role: finishedMsg.role,
                    parts: finishedMsg.parts,
                    createdAt: new Date(),
                    attachments: [],
                    chatId: id,
                  },
                ],
              });
            }
          }
        } else if (finishedMessages.length > 0) {
          await saveMessages({
            messages: finishedMessages.map((currentMessage) => ({
              id: currentMessage.id,
              role: currentMessage.role,
              parts: currentMessage.parts,
              createdAt: new Date(),
              attachments: [],
              chatId: id,
            })),
          });
        }

        if (finishedMessages.length > 0 && mentionIdsToMarkSeen.length > 0) {
          await Promise.all(
            mentionIdsToMarkSeen.map((mentionId) =>
              serverTaskMentionsApi
                .update(mentionId, { status: "seen" })
                .catch((error) => {
                  console.error(
                    `Failed to update mention ${mentionId} to seen:`,
                    error
                  );
                })
            )
          );
        }
      },
      onError: () => "Oops, an error occurred!",
    });

    return createUIMessageStreamResponse({
      stream,
      async consumeSseStream({ stream: sseStream }) {
        if (!process.env.REDIS_URL) {
          return;
        }
        try {
          const streamContext = getStreamContext();
          if (streamContext) {
            const streamId = generateId();
            await createStreamId({ streamId, chatId: id });
            await streamContext.createNewResumableStream(
              streamId,
              () => sseStream
            );
          }
        } catch (_) {
          // ignore redis errors
        }
      },
    });
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    if (
      error instanceof Error &&
      error.message?.includes(
        "AI Gateway requires a valid credit card on file to service requests"
      )
    ) {
      return new ChatSDKError("bad_request:activate_gateway").toResponse();
    }

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await getSession();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
