"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  canAccessPublicPath,
  isPanelOnlyNavRole,
} from "@/components/layout/siteNav";
import { getDashboardPath } from "@/lib/profileRoutes";
import { getStoredUser } from "@/lib/auth";

function getRedirectPath(role?: string): string {
  if (isPanelOnlyNavRole(role)) {
    return getDashboardPath(role);
  }

  if (role?.toLowerCase() === "doctor") {
    return "/";
  }

  return "/";
}

export default function PublicRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    const role = user?.role;

    if (canAccessPublicPath(role, pathname)) {
      setAllowed(true);
      return;
    }

    setAllowed(false);
    router.replace(getRedirectPath(role));
  }, [pathname, router]);

  if (!allowed) {
    return null;
  }

  return children;
}
