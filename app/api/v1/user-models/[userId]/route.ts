import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiBadRequest, apiServerError } from "@/app/api/v1/_lib/response";
import { serverUserModelsApi } from "@/lib/supabase/server-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { userId } = await params;
    const models = await serverUserModelsApi.getByUserId(userId);
    return apiSuccess(models);
  } catch (error) {
    console.error("Failed to fetch user models:", error);
    return apiServerError();
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { userId } = await params;
    const body = await request.json();

    if (!body.action) return apiBadRequest("Field 'action' is required (add, remove, or select)");
    if (!body.model_id) return apiBadRequest("Field 'model_id' is required");
    if (!body.model_name) return apiBadRequest("Field 'model_name' is required");
    if (!body.provider) return apiBadRequest("Field 'provider' is required");

    const model = { model_id: body.model_id, model_name: body.model_name, provider: body.provider };

    if (body.action === "add") {
      const result = await serverUserModelsApi.addCustomModel(userId, model);
      return apiSuccess(result, 201);
    } else if (body.action === "remove") {
      const result = await serverUserModelsApi.removeDefaultModel(userId, model);
      return apiSuccess(result, 201);
    } else if (body.action === "select") {
      await serverUserModelsApi.selectModel(userId, model);
      return apiSuccess({ selected: true });
    }

    return apiBadRequest("Field 'action' must be 'add', 'remove', or 'select'");
  } catch (error) {
    console.error("Failed to manage user model:", error);
    return apiServerError();
  }
}
