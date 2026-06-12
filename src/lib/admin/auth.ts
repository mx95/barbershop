import { createHmac, timingSafeEqual } from "crypto";
import { BARBERS } from "@/lib/constants";

const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "tom-dev-admin-secret-change-me";
}

export function getAdminPassword(barberId: string): string | null {
  const envKey = `${barberId.toUpperCase()}_ADMIN_PASSWORD`;
  const fromEnv = process.env[envKey];
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") {
    return barberId === "spyros" ? "spyros2024" : barberId === "lambros" ? "lambros2024" : null;
  }
  return null;
}

export function verifyAdminCredentials(barberId: string, password: string): boolean {
  const validIds = BARBERS.map((b) => b.id);
  if (!validIds.includes(barberId as (typeof validIds)[number])) return false;
  const expected = getAdminPassword(barberId);
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createAdminToken(barberId: string): string {
  const issuedAt = Date.now().toString();
  const payload = `${barberId}:${issuedAt}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyAdminToken(token: string | null | undefined): string | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [barberId, issuedAt, sig] = decoded.split(":");
    if (!barberId || !issuedAt || !sig) return null;
    const payload = `${barberId}:${issuedAt}`;
    const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    if (Date.now() - Number(issuedAt) > SESSION_MAX_AGE_MS) return null;
    const validIds = BARBERS.map((b) => b.id);
    if (!validIds.includes(barberId as (typeof validIds)[number])) return null;
    return barberId;
  } catch {
    return null;
  }
}

export function getAdminBarberIdFromRequest(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return verifyAdminToken(header.slice(7));
  }
  return verifyAdminToken(request.headers.get("x-admin-token"));
}
