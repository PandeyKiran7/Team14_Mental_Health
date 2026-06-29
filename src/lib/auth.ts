const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export function signOut() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("auth-change"));
  }
}

export type StoredUser = {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  mobileNumber?: string;
  address?: string;
  gender?: string;
  isActive?: string;
  profileImageURL?: string;
};

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/** Client-side JWT expiry check (no signature verification). */
export function isAccessTokenExpired(token?: string | null): boolean {
  const value = token ?? getAccessToken();
  if (!value) return true;

  try {
    const segment = value.split(".")[1];
    if (!segment) return false;

    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { exp?: number };
    if (typeof payload.exp !== "number") return false;

    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}

export function setAccessToken(accessToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.dispatchEvent(new Event("auth-change"));
}

export function setStoredUser(user: StoredUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth-change"));
}
