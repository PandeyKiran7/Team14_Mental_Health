import { signOut } from "@/lib/auth";

export function handleSessionExpired(): void {
  signOut();
  if (typeof window !== "undefined") {
    window.location.assign("/login?expired=1");
  }
}

export function isUnauthorizedStatus(status: number): boolean {
  return status === 401 || status === 403;
}
