export function getProfilePath(role?: string): string {
  const normalized = role?.toLowerCase();

  if (normalized === "patient") return "/patient/profile";
  if (normalized === "doctor") return "/doctor/profile";
  if (normalized === "admin") return "/admin/profile";

  return "/";
}
