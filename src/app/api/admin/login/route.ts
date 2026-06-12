import { NextResponse } from "next/server";
import { createAdminToken, verifyAdminCredentials } from "@/lib/admin/auth";

export async function POST(request: Request) {
  try {
    const { barberId, password } = await request.json();
    if (!barberId || !password) {
      return NextResponse.json({ error: "Barber and password required" }, { status: 400 });
    }
    if (!verifyAdminCredentials(barberId, password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = createAdminToken(barberId);
    return NextResponse.json({ token, barberId });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
