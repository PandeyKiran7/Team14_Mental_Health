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
  "/admin/doctors": {
    title: "Doctors",
    subtitle: "Register doctors and manage professional profiles",
  },
  "/admin/doctors/register": {
    title: "Register doctor",
    subtitle: "Create doctor account and professional profile",
  },
  "/admin/patients": {
    title: "Patients",
    subtitle: "Registered patients and medical record lookup",
  },
  "/admin/content-managers": {
    title: "Content managers",
    subtitle: "Register and manage content manager accounts",
  },
  "/admin/content-managers/register": {
    title: "Register content manager",
    subtitle: "Create a new content manager account",
  },
  "/admin/monitoring": {
    title: "Monitoring",
    subtitle: "System health, usage metrics, and activity logs",
  },
  "/admin/profile": {
    title: "My Profile",
    subtitle: "Your admin account information",
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
