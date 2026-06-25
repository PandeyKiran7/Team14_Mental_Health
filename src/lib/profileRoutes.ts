export function getProfilePath(role?: string): string {
  const normalized = role?.toLowerCase();

  if (normalized === "patient") return "/patient/profile";
  if (normalized === "doctor") return "/doctor/profile";
  if (normalized === "admin") return "/admin/profile";
  if (normalized === "internal_manager" || normalized === "content_manager") {
    return "/content-manager/profile";
  }

  return "/";
}

export function getDashboardPath(role?: string): string {
  const normalized = role?.toLowerCase();

  if (normalized === "patient") return "/patient/dashboard";
  if (normalized === "doctor") return "/doctor/dashboard";
  if (normalized === "admin") return "/admin/dashboard";
  if (normalized === "internal_manager" || normalized === "content_manager") {
    return "/content-manager/blogs";
  }

  return "/";
}
