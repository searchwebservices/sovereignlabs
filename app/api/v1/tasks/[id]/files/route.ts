import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiBadRequest, apiServerError, apiSuccess } from "@/app/api/v1/_lib/response";
import { serverDriveFilesApi, serverTaskFilesApi } from "@/lib/supabase/server-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const files = await serverTaskFilesApi.getByTask(id);
    return apiSuccess(files);
  } catch (error) {
    console.error("Failed to fetch task files:", error);
    return apiServerError();
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.name) return apiBadRequest("Field 'name' is required");
    if (!body.drive_file_id && !body.url) {
      return apiBadRequest("Field 'drive_file_id' or 'url' is required");
    }

    let resolvedUrl: string | null = body.url ? String(body.url) : null;

    if (body.drive_file_id) {
      const driveFile = await serverDriveFilesApi.getById(String(body.drive_file_id));
      if (!driveFile) return apiBadRequest("Invalid 'drive_file_id'");
      resolvedUrl = driveFile.is_public
        ? `/api/files/${driveFile.id}`
        : `/api/drive/files/${driveFile.id}`;
    }

    const file = await serverTaskFilesApi.create({
      task_id: id,
      name: String(body.name),
      url: resolvedUrl as string,
      content_type: body.content_type ? String(body.content_type) : null,
      file_size:
        typeof body.file_size === "number" ? Math.trunc(body.file_size) : null,
      uploaded_by: body.uploaded_by ? String(body.uploaded_by) : null,
      drive_file_id: body.drive_file_id ? String(body.drive_file_id) : null,
    });

    return apiSuccess(file, 201);
  } catch (error) {
    console.error("Failed to create task file:", error);
    return apiServerError();
  }
}
