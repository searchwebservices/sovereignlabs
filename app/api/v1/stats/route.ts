import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiServerError } from "@/app/api/v1/_lib/response";
import { getServerLabStats } from "@/lib/supabase/server-api";

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const stats = await getServerLabStats();
    return apiSuccess(stats);
  } catch (error) {
    console.error("Failed to fetch lab stats:", error);
    return apiServerError();
  }
}
