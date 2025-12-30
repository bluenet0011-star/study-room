import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Create date-based directory structure
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const relativeDir = `uploads/${year}/${month}`;
        const uploadDir = path.join(process.cwd(), "public", relativeDir);

        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename to prevent overwrite
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.name);
        const filename = `${path.basename(file.name, ext)}-${uniqueSuffix}${ext}`;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        const url = `/${relativeDir}/${filename}`;

        return NextResponse.json({ url, filename: file.name });
    } catch (e) {
        console.error("Upload error:", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
