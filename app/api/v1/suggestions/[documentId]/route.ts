import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiServerError } from "@/app/api/v1/_lib/response";
import { getSuggestionsByDocumentId } from "@/lib/db/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { documentId } = await params;
    const suggestions = await getSuggestionsByDocumentId({ documentId });
    return apiSuccess(suggestions);
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
    return apiServerError();
  }
}
