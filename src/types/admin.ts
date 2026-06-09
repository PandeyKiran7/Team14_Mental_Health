export type AdminUser = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: string;
  createdAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeUsers(data: any): AdminUser[] {
  const raw = Array.isArray(data?.message) ? data.message : [];
  return raw.map((u: any) => ({
    userId: u.userId,
    firstName: u.firstName ?? "",
    lastName: u.lastName ?? "",
    email: u.email ?? "",
    role: u.role ?? "unknown",
    isActive: u.isActive ?? "ACTIVE",
    createdAt: u.createdAt ?? "",
  }));
}