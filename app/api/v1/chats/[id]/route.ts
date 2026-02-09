import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiNotFound, apiServerError } from "@/app/api/v1/_lib/response";
import { getChatById, deleteChatById } from "@/lib/db/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const chat = await getChatById({ id });
    if (!chat) return apiNotFound("Chat");
    return apiSuccess(chat);
  } catch (error) {
    console.error("Failed to fetch chat:", error);
    return apiServerError();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    await deleteChatById({ id });
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Failed to delete chat:", error);
    return apiServerError();
  }
}
