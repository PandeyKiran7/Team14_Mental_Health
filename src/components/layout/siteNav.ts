export type SiteNavItem = {
  href: string;
  label: string;
};

const PUBLIC_NAV: SiteNavItem[] = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blogs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const DOCTOR_PUBLIC_NAV: SiteNavItem[] = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blogs" },
];

function isBlogPath(pathname: string): boolean {
  return pathname === "/blogs" || pathname.startsWith("/blogs/");
}

function normalizeRole(role?: string): string {
  return role?.toLowerCase().replace(/-/g, "_") ?? "";
}

/** Public site header links — panel roles see only what fits their account. */
export function getSiteNavItems(role?: string): SiteNavItem[] {
  const normalized = normalizeRole(role);

  if (!normalized) {
    return PUBLIC_NAV;
  }

  switch (normalized) {
    case "patient":
      return PUBLIC_NAV;
    case "doctor":
      return DOCTOR_PUBLIC_NAV;
    case "admin":
    case "internal_manager":
    case "content_manager":
      return [];
    default:
      return PUBLIC_NAV;
  }
}

export function usesPanelDashboard(role?: string): boolean {
  const normalized = normalizeRole(role);
  return ["patient", "doctor", "admin", "internal_manager", "content_manager"].includes(
    normalized,
  );
}

/** Admin & internal manager: no public site links — dashboard only. */
export function isPanelOnlyNavRole(role?: string): boolean {
  const normalized = normalizeRole(role);
  return ["admin", "internal_manager", "content_manager"].includes(normalized);
}

/** Whether a logged-in role may open a public marketing page (direct URL included). */
export function canAccessPublicPath(role: string | undefined, pathname: string): boolean {
  const normalized = normalizeRole(role);

  if (!normalized || normalized === "patient") {
    return true;
  }

  if (normalized === "doctor") {
    return pathname === "/" || isBlogPath(pathname);
  }

  if (isPanelOnlyNavRole(role)) {
    return false;
  }

  return true;
}
