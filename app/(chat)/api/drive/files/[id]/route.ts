import { NextResponse } from "next/server";
import { getSession } from "@/lib/supabase/server";
import { serverDriveFilesApi } from "@/lib/supabase/server-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const mode = new URL(request.url).searchParams.get("mode");
    const file = await serverDriveFilesApi.getByIdWithData(id);

    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const disposition = mode === "download" ? "attachment" : "inline";

    return new Response(file.data, {
      status: 200,
      headers: {
        "Content-Type": file.content_type,
        "Content-Length": String(file.size_bytes),
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(file.name)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Failed to fetch internal drive file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
