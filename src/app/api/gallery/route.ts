import { NextResponse } from "next/server";
import { readGallery } from "@/lib/store/gallery";

export const dynamic = "force-dynamic";

export async function GET() {
  const images = await readGallery();
  return NextResponse.json(
    { images },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
