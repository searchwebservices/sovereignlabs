import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiBadRequest, apiServerError } from "@/app/api/v1/_lib/response";
import { serverDevicesApi } from "@/lib/supabase/server-api";

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const devices = await serverDevicesApi.getAll();
    return apiSuccess(devices);
  } catch (error) {
    console.error("Failed to fetch devices:", error);
    return apiServerError();
  }
}

export async function POST(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const body = await request.json();
    if (!body.name) return apiBadRequest("Field 'name' is required");

    const device = await serverDevicesApi.create(body);
    return apiSuccess(device, 201);
  } catch (error) {
    console.error("Failed to create device:", error);
    return apiServerError();
  }
}
