import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiServerError } from "@/app/api/v1/_lib/response";
import { serverInitiativesApi } from "@/lib/supabase/server-api";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { assignmentId } = await params;
    await serverInitiativesApi.unassignPart(assignmentId);
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Failed to unassign part:", error);
    return apiServerError();
  }
}
