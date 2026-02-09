import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiNotFound, apiServerError } from "@/app/api/v1/_lib/response";
import { getDocumentsById, deleteDocumentsByIdAfterTimestamp } from "@/lib/db/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const documents = await getDocumentsById({ id });
    if (!documents.length) return apiNotFound("Document");
    return apiSuccess(documents);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
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
    const { searchParams } = new URL(request.url);
    const timestamp = searchParams.get("timestamp");

    const result = await deleteDocumentsByIdAfterTimestamp({
      id,
      timestamp: timestamp ? new Date(timestamp) : new Date(0),
    });
    return apiSuccess({ deleted: result.length });
  } catch (error) {
    console.error("Failed to delete documents:", error);
    return apiServerError();
  }
}
