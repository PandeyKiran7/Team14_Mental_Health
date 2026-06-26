import { getAccessToken, isAccessTokenExpired, signOut } from "@/lib/auth";

let sessionExpiryInProgress = false;

export function handleSessionExpired(): void {
  if (sessionExpiryInProgress || typeof window === "undefined") return;

  sessionExpiryInProgress = true;
  signOut();
  window.location.assign("/");
}

export function isUnauthorizedStatus(status: number): boolean {
  return status === 401 || status === 403;
}

/** Clears session and redirects home when token is missing or expired. */
export function redirectIfSessionInvalid(): boolean {
  const token = getAccessToken();
  if (!token || isAccessTokenExpired(token)) {
    handleSessionExpired();
    return true;
  }
  return false;
}

export function maybeHandleSessionExpired(
  status: number,
  hadAuth: boolean,
): void {
  if (hadAuth && isUnauthorizedStatus(status)) {
    handleSessionExpired();
  }
}
