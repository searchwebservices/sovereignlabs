import { validateApiKey } from "@/app/api/v1/_lib/auth";
import { serverDriveFilesApi } from "@/lib/supabase/server-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request);
  if (!auth.valid) return auth.response;

  try {
    const { id } = await params;
    const file = await serverDriveFilesApi.getByIdWithData(id);

    if (!file) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(file.data, {
      status: 200,
      headers: {
        "Content-Type": file.content_type,
        "Content-Length": String(file.size_bytes),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Failed to download drive file:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
