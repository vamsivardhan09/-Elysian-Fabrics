import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Save to public/uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Ensure the folder exists
    await mkdir(uploadDir, { recursive: true });

    // Generate unique name
    const ext = path.extname(file.name) || ".jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    await writeFile(filePath, new Uint8Array(buffer));

    // Return the relative URL of the uploaded image
    const fileUrl = `/uploads/${uniqueName}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
