import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { GALLERY_IMAGES } from "@/lib/constants";

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  span: string;
  created_at: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "gallery.json");

async function ensureFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(FILE, "utf-8");
  } catch {
    const seed: GalleryImage[] = GALLERY_IMAGES.map((img, i) => ({
      id: `seed-${i}`,
      src: img.src,
      alt: img.alt,
      span: img.span,
      created_at: new Date().toISOString(),
    }));
    await writeFile(FILE, JSON.stringify(seed, null, 2), "utf-8");
  }
}

export async function readGallery(): Promise<GalleryImage[]> {
  await ensureFile();
  const raw = await readFile(FILE, "utf-8");
  return JSON.parse(raw) as GalleryImage[];
}

export async function addGalleryImage(
  input: Omit<GalleryImage, "id" | "created_at">
): Promise<GalleryImage> {
  const images = await readGallery();
  const image: GalleryImage = {
    ...input,
    id: randomUUID(),
    created_at: new Date().toISOString(),
  };
  images.push(image);
  await writeFile(FILE, JSON.stringify(images, null, 2), "utf-8");
  return image;
}

export async function deleteGalleryImage(id: string): Promise<boolean> {
  const images = await readGallery();
  const next = images.filter((img) => img.id !== id);
  if (next.length === images.length) return false;
  await writeFile(FILE, JSON.stringify(next, null, 2), "utf-8");
  return true;
}
