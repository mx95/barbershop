export const STAFF_TOKEN_KEY = "tom-admin-token";
export const STAFF_BARBER_KEY = "tom-admin-barber";
/** Set when /dashboard redirects to /account so staff can sign in without a public link */
export const STAFF_PROMPT_KEY = "tom-staff-prompt";

export function getStaffSession(): { token: string; barberId: string } | null {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem(STAFF_TOKEN_KEY);
  const barberId = sessionStorage.getItem(STAFF_BARBER_KEY);
  if (!token || !barberId) return null;
  return { token, barberId };
}

export function setStaffSession(token: string, barberId: string) {
  sessionStorage.setItem(STAFF_TOKEN_KEY, token);
  sessionStorage.setItem(STAFF_BARBER_KEY, barberId);
}

export function clearStaffSession() {
  sessionStorage.removeItem(STAFF_TOKEN_KEY);
  sessionStorage.removeItem(STAFF_BARBER_KEY);
}

export function markStaffLoginPrompt() {
  sessionStorage.setItem(STAFF_PROMPT_KEY, "1");
}

export function consumeStaffLoginPrompt(): boolean {
  if (typeof window === "undefined") return false;
  const flagged = sessionStorage.getItem(STAFF_PROMPT_KEY) === "1";
  if (flagged) sessionStorage.removeItem(STAFF_PROMPT_KEY);
  return flagged;
}
