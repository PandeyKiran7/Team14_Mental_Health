"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getStoredUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/userRoles";
import { handleSessionExpired, redirectIfSessionInvalid } from "@/lib/session";

const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/admin/dashboard": {
    title: "Overview",
  },
  "/admin/users": {
    title: "Users",
  },
  "/admin/users/register/doctor": {
    title: "Register doctor",
  },
  "/admin/users/register/patient": {
    title: "Register patient",
  },
  "/admin/content-managers": {
    title: "Internal managers",
  },
  "/admin/content-managers/register": {
    title: "Register internal manager",
  },
  "/admin/monitoring": {
    title: "Monitoring",
  },
  "/admin/profile": {
    title: "My Profile",
  },
};

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const meta = PAGE_META[pathname] ?? {
    title: "Admin",
    subtitle: "Diabetes Management System",
  };

  useEffect(() => {
    if (redirectIfSessionInvalid()) return;

    const user = getStoredUser();
    if (!user || !isAdminRole(user.role)) {
      router.replace("/");
    }
  }, [pathname, router]);

  return (
    <AdminShell title={meta.title} subtitle={meta.subtitle}>
      {children}
    </AdminShell>
  );
}
