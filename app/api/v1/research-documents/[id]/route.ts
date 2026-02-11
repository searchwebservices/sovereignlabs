import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiNotFound, apiServerError, apiSuccess } from "@/app/api/v1/_lib/response";
import { serverResearchDocumentsApi } from "@/lib/supabase/server-api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    if (body.drive_file_id && !body.storage_url) {
      body.storage_url = `/api/drive/files/${body.drive_file_id}`;
    }
    const document = await serverResearchDocumentsApi.update(id, body);
    return apiSuccess(document);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "PGRST116") return apiNotFound("Research document");
    console.error("Failed to update research document:", error);
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
    await serverResearchDocumentsApi.delete(id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Failed to delete research document:", error);
    return apiServerError();
  }
}
