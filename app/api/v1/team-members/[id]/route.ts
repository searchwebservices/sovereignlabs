import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiNotFound, apiServerError } from "@/app/api/v1/_lib/response";
import { serverTeamMembersApi } from "@/lib/supabase/server-api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const member = await serverTeamMembersApi.update(id, body);
    return apiSuccess(member);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "PGRST116") return apiNotFound("Team member");
    console.error("Failed to update team member:", error);
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
    await serverTeamMembersApi.delete(id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Failed to delete team member:", error);
    return apiServerError();
  }
}
