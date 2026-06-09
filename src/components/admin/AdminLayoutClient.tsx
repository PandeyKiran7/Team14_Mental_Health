"use client";

import { usePathname } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/admin/dashboard": {
    title: "Overview",
    subtitle: "System summary and recent activity",
  },
  "/admin/users": {
    title: "Users",
    subtitle: "Manage all registered patients, doctors, and admins",
  },
  "/admin/resources": {
    title: "Resources",
    subtitle: "Articles, videos, and self-help content",
  },
  "/admin/monitoring": {
    title: "Monitoring",
    subtitle: "System health, usage metrics, and activity logs",
  },
};

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? {
    title: "Admin",
    subtitle: "Diabetes Management System",
  };

  return (
    <AdminShell title={meta.title} subtitle={meta.subtitle}>
      {children}
    </AdminShell>
  );
}
