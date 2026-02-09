import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiNotFound, apiServerError } from "@/app/api/v1/_lib/response";
import { serverInitiativesApi } from "@/lib/supabase/server-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const initiative = await serverInitiativesApi.getById(id);
    return apiSuccess(initiative);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "PGRST116") return apiNotFound("Initiative");
    console.error("Failed to fetch initiative:", error);
    return apiServerError();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const initiative = await serverInitiativesApi.update(id, body);
    return apiSuccess(initiative);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "PGRST116") return apiNotFound("Initiative");
    console.error("Failed to update initiative:", error);
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
    await serverInitiativesApi.delete(id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Failed to delete initiative:", error);
    return apiServerError();
  }
}
