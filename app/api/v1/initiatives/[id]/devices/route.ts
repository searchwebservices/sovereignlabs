import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiBadRequest, apiServerError } from "@/app/api/v1/_lib/response";
import { serverInitiativesApi } from "@/lib/supabase/server-api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.deviceId) return apiBadRequest("Field 'deviceId' is required");

    const assignment = await serverInitiativesApi.assignDevice(id, body.deviceId, body.notes);
    return apiSuccess(assignment, 201);
  } catch (error) {
    console.error("Failed to assign device:", error);
    return apiServerError();
  }
}
