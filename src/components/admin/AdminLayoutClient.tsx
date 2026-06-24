"use client";

import { usePathname } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/admin/dashboard": {
    title: "Overview",
  },
  "/admin/users": {
    title: "Users",
  },
  "/admin/doctors": {
    title: "Doctors",
  },
  "/admin/doctors/register": {
    title: "Register doctor",
  },
  "/admin/patients": {
    title: "Patients",
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
