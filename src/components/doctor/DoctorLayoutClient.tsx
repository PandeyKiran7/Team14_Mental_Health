"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import ApiMessage from "@/components/ui/ApiMessage";
import { getDoctorProfileStatus } from "@/lib/doctorProfile";
import { getAccessToken, getStoredUser } from "@/lib/auth";
import { handleSessionExpired } from "@/lib/session";

const PAGE_META: Record<string, { title?: string; subtitle?: string }> = {
  "/doctor/dashboard": {},
  "/doctor/bookings": {
    title: "Appointments",
    subtitle: "Review requests, approve bookings, and add prescriptions",
  },
  "/doctor/profile": {
    title: "My Profile",
    subtitle: "Your account and professional details",
  },
};

const PROFILE_OPTIONAL_PATHS = ["/doctor/profile"];

export default function DoctorLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [guardError, setGuardError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
      setReady(false);
      setGuardError(null);

      const token = getAccessToken();
      const user = getStoredUser();

      if (!token || !user) {
        router.replace("/login");
        return;
      }

      if (user.role?.toUpperCase() !== "DOCTOR") {
        router.replace("/");
        return;
      }

      const profileOptional = PROFILE_OPTIONAL_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      );

      if (profileOptional) {
        if (!cancelled) setReady(true);
        return;
      }

      const profileStatus = await getDoctorProfileStatus(token);

      if (cancelled) return;

      if (profileStatus === "unauthorized") {
        handleSessionExpired();
        return;
      }

      if (profileStatus === "missing") {
        router.replace("/doctor/profile");
        return;
      }

      if (profileStatus === "error") {
        setGuardError(
          "Cannot verify your doctor profile. Make sure the backend is running, then refresh this page.",
        );
        setReady(true);
        return;
      }

      setReady(true);
    }

    void verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const meta = PAGE_META[pathname] ?? {
    title: "Doctor",
    subtitle: "Diabetes Management System",
  };

  if (!ready) {
    return (
      <DashboardShell
        role="doctor"
        title={meta.title ?? ""}
        subtitle={meta.subtitle}
      >
        <p className="text-sm text-zinc-500">Loading…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="doctor"
      title={meta.title ?? ""}
      subtitle={meta.subtitle}
    >
      {guardError && <ApiMessage message={guardError} variant="info" className="mb-4" />}
      {children}
    </DashboardShell>
  );
}
