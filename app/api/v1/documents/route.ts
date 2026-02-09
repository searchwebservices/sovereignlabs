import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiBadRequest, apiServerError } from "@/app/api/v1/_lib/response";
import { saveDocument } from "@/lib/db/queries";

export async function POST(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const body = await request.json();
    if (!body.id) return apiBadRequest("Field 'id' is required");
    if (!body.title) return apiBadRequest("Field 'title' is required");
    if (!body.userId) return apiBadRequest("Field 'userId' is required");

    const doc = await saveDocument({
      id: body.id,
      title: body.title,
      kind: body.kind || "text",
      content: body.content || "",
      userId: body.userId,
    });
    return apiSuccess(doc, 201);
  } catch (error) {
    console.error("Failed to create document:", error);
    return apiServerError();
  }
}
