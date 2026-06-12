export const CUSTOMER_TOKEN_KEY = "tom-customer-token";
export const CUSTOMER_PHONE_KEY = "tom-customer-phone";
export const CUSTOMER_EMAIL_KEY = "tom-customer-email";

export type CustomerSession = {
  token: string;
  phone: string;
  email: string;
};

export function getCustomerSession(): CustomerSession | null {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem(CUSTOMER_TOKEN_KEY);
  const phone = sessionStorage.getItem(CUSTOMER_PHONE_KEY);
  const email = sessionStorage.getItem(CUSTOMER_EMAIL_KEY);
  if (!token || !phone || !email) return null;
  return { token, phone, email };
}

export function setCustomerSession(token: string, phone: string, email: string) {
  sessionStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  sessionStorage.setItem(CUSTOMER_PHONE_KEY, phone);
  sessionStorage.setItem(CUSTOMER_EMAIL_KEY, email);
}

export function clearCustomerSession() {
  sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
  sessionStorage.removeItem(CUSTOMER_PHONE_KEY);
  sessionStorage.removeItem(CUSTOMER_EMAIL_KEY);
}
