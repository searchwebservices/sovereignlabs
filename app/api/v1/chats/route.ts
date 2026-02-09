import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { apiSuccess, apiBadRequest, apiServerError } from "@/app/api/v1/_lib/response";
import { getChatsByUserId } from "@/lib/db/queries";

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return apiBadRequest("Query param 'userId' is required");

    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const startingAfter = searchParams.get("startingAfter");
    const endingBefore = searchParams.get("endingBefore");

    const result = await getChatsByUserId({
      id: userId,
      limit,
      startingAfter,
      endingBefore,
    });
    return apiSuccess(result);
  } catch (error) {
    console.error("Failed to fetch chats:", error);
    return apiServerError();
  }
}
