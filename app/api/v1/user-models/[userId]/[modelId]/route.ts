import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiBadRequest, apiServerError } from "@/app/api/v1/_lib/response";
import { serverUserModelsApi } from "@/lib/supabase/server-api";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string; modelId: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { userId, modelId } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "delete_custom";

    if (action === "delete_custom") {
      await serverUserModelsApi.deleteCustomModel(userId, modelId);
      return apiSuccess({ deleted: true });
    } else if (action === "restore_default") {
      await serverUserModelsApi.restoreDefaultModel(userId, modelId);
      return apiSuccess({ restored: true });
    }

    return apiBadRequest("Query param 'action' must be 'delete_custom' or 'restore_default'");
  } catch (error) {
    console.error("Failed to delete/restore user model:", error);
    return apiServerError();
  }
}
