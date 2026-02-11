import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiServerError, apiSuccess } from "@/app/api/v1/_lib/response";
import { serverTaskFilesApi } from "@/lib/supabase/server-api";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { fileId } = await params;
    await serverTaskFilesApi.delete(fileId);
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Failed to delete task file:", error);
    return apiServerError();
  }
}
