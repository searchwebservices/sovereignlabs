import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiServerError } from "@/app/api/v1/_lib/response";
import { getMessagesByChatId } from "@/lib/db/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const messages = await getMessagesByChatId({ id });
    return apiSuccess(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return apiServerError();
  }
}
