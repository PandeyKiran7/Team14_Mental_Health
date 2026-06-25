"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import DoctorProfessionalSetupModal from "@/components/doctor/DoctorProfessionalSetupModal";
import ApiMessage from "@/components/ui/ApiMessage";
import { getDoctorProfileStatus } from "@/lib/doctorProfile";
import { getAccessToken, getStoredUser } from "@/lib/auth";
import { handleSessionExpired } from "@/lib/session";

const PAGE_META: Record<string, { title?: string; subtitle?: string }> = {
  "/doctor/dashboard": { title: "Overview" },
  "/doctor/bookings": { title: "Appointments" },
  "/doctor/profile": { title: "My Profile" },
};

export default function DoctorLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [guardError, setGuardError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
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

      const profileStatus = await getDoctorProfileStatus(token);

      if (cancelled) return;

      if (profileStatus === "unauthorized") {
        handleSessionExpired();
        return;
      }

      if (profileStatus === "error") {
        setGuardError(
          "Cannot verify your doctor profile. Make sure the backend is running, then refresh this page.",
        );
        setProfileComplete(false);
        setReady(true);
        return;
      }

      setProfileComplete(profileStatus === "complete");
      setReady(true);
    }

    void verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleProfileCompleted() {
    const token = getAccessToken();
    if (!token) return;

    const profileStatus = await getDoctorProfileStatus(token);
    setProfileComplete(profileStatus === "complete");
  }

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
      {guardError && (
        <ApiMessage message={guardError} variant="info" className="mb-4" />
      )}
      {children}
      <DoctorProfessionalSetupModal
        open={!profileComplete && pathname !== "/doctor/profile"}
        onComplete={() => void handleProfileCompleted()}
      />
    </DashboardShell>
  );
}
