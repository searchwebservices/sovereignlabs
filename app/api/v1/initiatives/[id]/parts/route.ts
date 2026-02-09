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
    if (!body.partId) return apiBadRequest("Field 'partId' is required");
    if (!body.quantity) return apiBadRequest("Field 'quantity' is required");

    const assignment = await serverInitiativesApi.assignPart(id, body.partId, body.quantity, body.notes);
    return apiSuccess(assignment, 201);
  } catch (error) {
    console.error("Failed to assign part:", error);
    return apiServerError();
  }
}
