"use client";

import { usePathname } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";

const PAGE_META: Record<string, { title?: string; subtitle?: string }> = {
  "/patient/dashboard": {},
  "/patient/bookings": {
    title: "Appointments",
    subtitle: "Book and manage your doctor appointments",
  },
  "/patient/profile": {
    title: "Patient profile",
    subtitle: "Complete your medical details to use the platform",
  },
};

export default function PatientLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? {
    title: "Patient",
    subtitle: "Diabetes Management System",
  };

  return (
    <DashboardShell
      role="patient"
      title={meta.title ?? ""}
      subtitle={meta.subtitle}
    >
      {children}
    </DashboardShell>
  );
}
