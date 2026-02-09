import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiBadRequest, apiServerError } from "@/app/api/v1/_lib/response";
import { serverTeamMembersApi } from "@/lib/supabase/server-api";

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const members = await serverTeamMembersApi.getAll();
    return apiSuccess(members);
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return apiServerError();
  }
}

export async function POST(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const body = await request.json();
    if (!body.name) return apiBadRequest("Field 'name' is required");

    const member = await serverTeamMembersApi.create(body);
    return apiSuccess(member, 201);
  } catch (error) {
    console.error("Failed to create team member:", error);
    return apiServerError();
  }
}
