import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiServerError } from "@/app/api/v1/_lib/response";
import { serverPartsApi } from "@/lib/supabase/server-api";

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const parts = await serverPartsApi.getSpare();
    return apiSuccess(parts);
  } catch (error) {
    console.error("Failed to fetch spare parts:", error);
    return apiServerError();
  }
}
