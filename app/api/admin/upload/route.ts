import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

function sanitizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function isAuth() {
  const c = await cookies();
  return await verifySessionCookie(c.get(SESSION_COOKIE)?.value);
}

export async function POST(request: Request) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "לא נשלח קובץ" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ ok: false, error: "פורמט תמונה לא נתמך" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "הקובץ גדול מ-8MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const safeName = sanitizeName(file.name) || "upload";
  const fileName = `${timestamp}-${random}-${safeName}`;

  // Vercel Blob path (production)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`uploads/${fileName}`, buffer, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ ok: true, url: blob.url });
    } catch (err) {
      console.error("[upload] Vercel Blob error:", err);
      return NextResponse.json(
        { ok: false, error: "שגיאה בהעלאה ל-Vercel Blob" },
        { status: 500 }
      );
    }
  }

  // Local fallback (development)
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  await writeFile(path.join(uploadDir, fileName), buffer);
  return NextResponse.json({ ok: true, url: `/uploads/${fileName}` });
}
