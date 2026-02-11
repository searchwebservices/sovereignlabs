import { NextResponse } from "next/server";
import { getSession } from "@/lib/supabase/server";
import { serverDriveFilesApi } from "@/lib/supabase/server-api";

const MAX_INTERNAL_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    return NextResponse.json({
      data: files.map((file) => ({
        ...file,
        downloadUrl: `/api/drive/files/${file.id}`,
        publicUrl: file.is_public ? `/api/files/${file.id}` : null,
      })),
      error: null,
    });
  } catch (error) {
    console.error("Failed to list internal drive files:", error);
    return NextResponse.json(
      { data: null, error: { code: "server_error", message: "Failed to list files" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const scope = String(formData.get("scope") || "general");
    const isPublic = String(formData.get("isPublic") || "false") === "true";

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_INTERNAL_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 25MB limit" },
        { status: 400 }
      );
    }

    const fileFromForm = formData.get("file") as File;
    const filename = fileFromForm?.name || `file-${Date.now()}`;
    const contentType = file.type || "application/octet-stream";
    const data = Buffer.from(await file.arrayBuffer());

    const savedFile = await serverDriveFilesApi.createFromBuffer({
      name: filename,
      contentType,
      data,
      scope,
      isPublic,
      createdByUserId: session.user.id,
    });

    return NextResponse.json(
      {
        data: {
          ...savedFile,
          downloadUrl: `/api/drive/files/${savedFile.id}`,
          publicUrl: savedFile.is_public ? `/api/files/${savedFile.id}` : null,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to upload internal drive file:", error);
    return NextResponse.json(
      { data: null, error: { code: "server_error", message: "Upload failed" } },
      { status: 500 }
    );
  }
}
