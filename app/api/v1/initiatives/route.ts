import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiBadRequest, apiServerError } from "@/app/api/v1/_lib/response";
import { serverInitiativesApi } from "@/lib/supabase/server-api";

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const initiatives = await serverInitiativesApi.getAll();
    return apiSuccess(initiatives);
  } catch (error) {
    console.error("Failed to fetch initiatives:", error);
    return apiServerError();
  }
}

export async function POST(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const body = await request.json();
    if (!body.name) return apiBadRequest("Field 'name' is required");

    const initiative = await serverInitiativesApi.create(body);
    return apiSuccess(initiative, 201);
  } catch (error) {
    console.error("Failed to create initiative:", error);
    return apiServerError();
  }
}
