import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiBadRequest, apiServerError } from "@/app/api/v1/_lib/response";
import { serverPartsApi } from "@/lib/supabase/server-api";

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const parts = await serverPartsApi.getAll();
    return apiSuccess(parts);
  } catch (error) {
    console.error("Failed to fetch parts:", error);
    return apiServerError();
  }
}

export async function POST(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const body = await request.json();
    if (!body.name) return apiBadRequest("Field 'name' is required");

    const part = await serverPartsApi.create(body);
    return apiSuccess(part, 201);
  } catch (error) {
    console.error("Failed to create part:", error);
    return apiServerError();
  }
}
