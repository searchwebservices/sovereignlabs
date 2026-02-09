import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiBadRequest, apiServerError } from "@/app/api/v1/_lib/response";
import { serverTasksApi } from "@/lib/supabase/server-api";

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const tasks = await serverTasksApi.getAll();
    return apiSuccess(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return apiServerError();
  }
}

export async function POST(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const body = await request.json();
    if (!body.title) return apiBadRequest("Field 'title' is required");

    const task = await serverTasksApi.create(body);
    return apiSuccess(task, 201);
  } catch (error) {
    console.error("Failed to create task:", error);
    return apiServerError();
  }
}
