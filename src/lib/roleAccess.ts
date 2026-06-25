import { getAccessToken, getStoredUser } from "@/lib/auth";

export function canManageBlogs(role?: string): boolean {
  return role?.toUpperCase() === "INTERNAL_MANAGER";
}

export function isBlogManagerSession(): boolean {
  const token = getAccessToken();
  const user = getStoredUser();
  return Boolean(token && canManageBlogs(user?.role));
}
