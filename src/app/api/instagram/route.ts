import { NextResponse } from "next/server";
import { SITE } from "@/lib/constants";

const instagramProfile = SITE.instagramUrl;

const fallbackPosts = [
  { id: "1", caption: "Fresh fade 🔥", media_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80", permalink: instagramProfile, timestamp: new Date().toISOString() },
  { id: "2", caption: "Hot towel ritual", media_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80", permalink: instagramProfile, timestamp: new Date().toISOString() },
  { id: "3", caption: "The Temple", media_url: "/images/shop-wall.jpg", permalink: instagramProfile, timestamp: new Date().toISOString() },
  { id: "4", caption: "Beard sculpt", media_url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80", permalink: instagramProfile, timestamp: new Date().toISOString() },
  { id: "5", caption: "Premium grooming", media_url: "https://images.unsplash.com/photo-1585747860715-2ba5b469c776?w=400&q=80", permalink: instagramProfile, timestamp: new Date().toISOString() },
  { id: "6", caption: "Classic cut", media_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80", permalink: instagramProfile, timestamp: new Date().toISOString() },
];

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ posts: fallbackPosts });
  }

  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp&access_token=${token}&limit=6`
    );
    const data = await res.json();

    if (data.data?.length) {
      return NextResponse.json({ posts: data.data });
    }
  } catch {
    // fall through to fallback
  }

  return NextResponse.json({ posts: fallbackPosts });
}
