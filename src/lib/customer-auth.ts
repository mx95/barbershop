import { createHmac, timingSafeEqual } from "crypto";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  return process.env.CUSTOMER_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? "tom-dev-customer-secret";
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createCustomerToken(phone: string, email: string): string {
  const phoneNorm = normalizePhone(phone);
  const emailNorm = normalizeEmail(email);
  const issuedAt = Date.now().toString();
  const payload = `${phoneNorm}:${emailNorm}:${issuedAt}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyCustomerToken(token: string | null | undefined): {
  phone: string;
  email: string;
} | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [phoneNorm, emailNorm, issuedAt, sig] = decoded.split(":");
    if (!phoneNorm || !emailNorm || !issuedAt || !sig) return null;

    const payload = `${phoneNorm}:${emailNorm}:${issuedAt}`;
    const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    if (Date.now() - Number(issuedAt) > SESSION_MAX_AGE_MS) return null;

    return { phone: phoneNorm, email: emailNorm };
  } catch {
    return null;
  }
}

export function getCustomerFromRequest(request: Request): { phone: string; email: string } | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return verifyCustomerToken(header.slice(7));
  }
  return verifyCustomerToken(request.headers.get("x-customer-token"));
}
