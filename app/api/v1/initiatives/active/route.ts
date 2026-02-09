import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiServerError } from "@/app/api/v1/_lib/response";
import { serverInitiativesApi } from "@/lib/supabase/server-api";

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const initiatives = await serverInitiativesApi.getActive();
    return apiSuccess(initiatives);
  } catch (error) {
    console.error("Failed to fetch active initiatives:", error);
    return apiServerError();
  }
}
