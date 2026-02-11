import { serverDriveFilesApi } from "@/lib/supabase/server-api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const file = await serverDriveFilesApi.getByIdWithData(id);

    if (!file || !file.is_public) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(file.data, {
      status: 200,
      headers: {
        "Content-Type": file.content_type,
        "Content-Length": String(file.size_bytes),
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.name)}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to serve internal file:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
