import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiNotFound, apiServerError, apiSuccess } from "@/app/api/v1/_lib/response";
import { serverDriveFilesApi } from "@/lib/supabase/server-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const file = await serverDriveFilesApi.getById(id);
    if (!file) return apiNotFound("Drive file");

    return apiSuccess({
      ...file,
      download_url: `/api/v1/drive-files/${file.id}/download`,
      app_download_url: `/api/drive/files/${file.id}`,
      public_url: file.is_public ? `/api/files/${file.id}` : null,
    });
  } catch (error) {
    console.error("Failed to fetch drive file metadata:", error);
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
    await serverDriveFilesApi.delete(id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Failed to delete drive file:", error);
    return apiServerError();
  }
}
