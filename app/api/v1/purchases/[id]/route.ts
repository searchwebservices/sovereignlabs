import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiNotFound, apiServerError } from "@/app/api/v1/_lib/response";
import { serverPurchasesApi } from "@/lib/supabase/server-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const purchase = await serverPurchasesApi.getById(id);
    return apiSuccess(purchase);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "PGRST116") return apiNotFound("Purchase");
    console.error("Failed to fetch purchase:", error);
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
    const purchase = await serverPurchasesApi.update(id, body);
    return apiSuccess(purchase);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "PGRST116") return apiNotFound("Purchase");
    console.error("Failed to update purchase:", error);
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
    await serverPurchasesApi.delete(id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Failed to delete purchase:", error);
    return apiServerError();
  }
}
