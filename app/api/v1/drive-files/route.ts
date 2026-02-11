import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiBadRequest, apiServerError, apiSuccess } from "@/app/api/v1/_lib/response";
import { serverDriveFilesApi } from "@/lib/supabase/server-api";

const MAX_INTERNAL_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

function stripDataUrlPrefix(value: string): string {
  const commaIndex = value.indexOf(",");
  if (value.startsWith("data:") && commaIndex > -1) {
    return value.slice(commaIndex + 1);
  }
  return value;
}

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || undefined;
    const isPublicParam = searchParams.get("isPublic");
    const isPublic =
      isPublicParam === null
        ? undefined
        : isPublicParam.toLowerCase() === "true";
    const limit = Number(searchParams.get("limit") || "100");

    const files = await serverDriveFilesApi.list({
      scope,
      isPublic,
      limit: Number.isFinite(limit) ? Math.max(1, Math.min(limit, 200)) : 100,
    });

    return apiSuccess(
      files.map((file) => ({
        ...file,
        download_url: `/api/v1/drive-files/${file.id}/download`,
        app_download_url: `/api/drive/files/${file.id}`,
        public_url: file.is_public ? `/api/files/${file.id}` : null,
      }))
    );
  } catch (error) {
    console.error("Failed to list drive files:", error);
    return apiServerError();
  }
}

export async function POST(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const body = await request.json();

    if (!body.name) return apiBadRequest("Field 'name' is required");
    if (!body.contentType) return apiBadRequest("Field 'contentType' is required");
    if (!body.dataBase64) return apiBadRequest("Field 'dataBase64' is required");

    const normalizedBase64 = stripDataUrlPrefix(String(body.dataBase64));
    const fileBuffer = Buffer.from(normalizedBase64, "base64");

    if (fileBuffer.byteLength === 0) {
      return apiBadRequest("Field 'dataBase64' is not valid base64 content");
    }

    if (fileBuffer.byteLength > MAX_INTERNAL_FILE_SIZE) {
      return apiBadRequest("File size exceeds 25MB limit");
    }

    const file = await serverDriveFilesApi.createFromBuffer({
      name: String(body.name),
      contentType: String(body.contentType),
      data: fileBuffer,
      scope: body.scope ? String(body.scope) : "general",
      isPublic: body.isPublic === true,
      createdByUserId: body.createdByUserId ? String(body.createdByUserId) : null,
    });

    return apiSuccess(
      {
        ...file,
        download_url: `/api/v1/drive-files/${file.id}/download`,
        app_download_url: `/api/drive/files/${file.id}`,
        public_url: file.is_public ? `/api/files/${file.id}` : null,
      },
      201
    );
  } catch (error) {
    console.error("Failed to create drive file:", error);
    return apiServerError();
  }
}
