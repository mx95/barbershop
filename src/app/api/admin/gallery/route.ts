import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { getAdminBarberIdFromRequest } from "@/lib/admin/auth";
import { addGalleryImage, deleteGalleryImage, readGallery } from "@/lib/store/gallery";

export const dynamic = "force-dynamic";

function localPublicImagePath(src: string): string | null {
  if (!src.startsWith("/images/")) return null;
  const resolved = path.normalize(path.join(process.cwd(), "public", src));
  const publicRoot = path.normalize(path.join(process.cwd(), "public", "images"));
  if (!resolved.startsWith(publicRoot)) return null;
  return resolved;
}

export async function GET() {
  const images = await readGallery();
  return NextResponse.json(
    { images },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function POST(request: Request) {
  const adminId = getAdminBarberIdFromRequest(request);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    const alt = String(form.get("alt") ?? "").trim() || "Gallery image";
    const span = String(form.get("span") ?? "col-span-1 row-span-1");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Image file required" }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "images", "gallery");
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const image = await addGalleryImage({
      src: `/images/gallery/${filename}`,
      alt,
      span,
    });
    revalidatePath("/gallery");
    return NextResponse.json({ image });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const adminId = getAdminBarberIdFromRequest(request);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const images = await readGallery();
  const image = images.find((img) => img.id === id);
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await deleteGalleryImage(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filePath = localPublicImagePath(image.src);
  if (filePath) {
    try {
      await unlink(filePath);
    } catch {
      // File may already be missing — metadata removal still succeeds
    }
  }

  revalidatePath("/gallery");
  return NextResponse.json({ ok: true });
}
