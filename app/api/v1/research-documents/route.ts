import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiBadRequest, apiServerError, apiSuccess } from "@/app/api/v1/_lib/response";
import { serverResearchDocumentsApi } from "@/lib/supabase/server-api";

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const documents = await serverResearchDocumentsApi.getAll();
    return apiSuccess(documents);
  } catch (error) {
    console.error("Failed to fetch research documents:", error);
    return apiServerError();
  }
}

export async function POST(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const body = await request.json();
    if (!body.title) return apiBadRequest("Field 'title' is required");

    if (body.drive_file_id && !body.storage_url) {
      body.storage_url = `/api/drive/files/${body.drive_file_id}`;
    }

    const document = await serverResearchDocumentsApi.create(body);
    return apiSuccess(document, 201);
  } catch (error) {
    console.error("Failed to create research document:", error);
    return apiServerError();
  }
}
