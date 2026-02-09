import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiBadRequest, apiServerError } from "@/app/api/v1/_lib/response";
import { getVotesByChatId, voteMessage } from "@/lib/db/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const votes = await getVotesByChatId({ id });
    return apiSuccess(votes);
  } catch (error) {
    console.error("Failed to fetch votes:", error);
    return apiServerError();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.messageId) return apiBadRequest("Field 'messageId' is required");
    if (!body.type || !["up", "down"].includes(body.type)) {
      return apiBadRequest("Field 'type' must be 'up' or 'down'");
    }

    await voteMessage({ chatId: id, messageId: body.messageId, type: body.type });
    return apiSuccess({ voted: true });
  } catch (error) {
    console.error("Failed to vote:", error);
    return apiServerError();
  }
}
