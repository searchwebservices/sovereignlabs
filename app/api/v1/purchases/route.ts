import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiBadRequest, apiServerError } from "@/app/api/v1/_lib/response";
import { serverPurchasesApi } from "@/lib/supabase/server-api";

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const purchases = await serverPurchasesApi.getAll();
    return apiSuccess(purchases);
  } catch (error) {
    console.error("Failed to fetch purchases:", error);
    return apiServerError();
  }
}

export async function POST(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const body = await request.json();
    if (!body.item_name) return apiBadRequest("Field 'item_name' is required");

    const purchase = await serverPurchasesApi.create(body);
    return apiSuccess(purchase, 201);
  } catch (error) {
    console.error("Failed to create purchase:", error);
    return apiServerError();
  }
}
