import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/supabase/server";
import { serverDriveFilesApi } from "@/lib/supabase/server-api";

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    // Update the file type based on the kind of files you want to accept
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
      message: "File type should be JPEG or PNG",
    }),
});

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const fileFromForm = formData.get("file") as File;
    const filename = fileFromForm.name || `upload-${Date.now()}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const savedFile = await serverDriveFilesApi.createFromBuffer({
      name: filename,
      contentType: file.type,
      data: fileBuffer,
      scope: "chat_attachment",
      isPublic: true,
      createdByUserId: session.user.id,
    });

    return NextResponse.json({
      id: savedFile.id,
      url: `/api/files/${savedFile.id}`,
      pathname: savedFile.name,
      contentType: savedFile.content_type,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
