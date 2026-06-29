"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import PatientMedicalSetupModal from "@/components/patient/PatientMedicalSetupModal";
import ApiMessage from "@/components/ui/ApiMessage";
import { getAccessToken, getStoredUser } from "@/lib/auth";
import { getPatientProfileStatus } from "@/lib/patientProfile";
import { getDashboardPath } from "@/lib/profileRoutes";
import { handleSessionExpired, redirectIfSessionInvalid } from "@/lib/session";

const PAGE_META: Record<string, { title?: string; subtitle?: string }> = {
  "/patient/dashboard": { title: "Dashboard" },
  "/patient/bookings": { title: "Appointments" },
  "/patient/profile": { title: "Patient profile" },
  "/patient/medical-profile": { title: "Medical profile" },
};

export default function PatientLayoutClient({
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

      if (redirectIfSessionInvalid()) return;

      const user = getStoredUser();

      if (!user) {
        handleSessionExpired();
        return;
      }

      if (user.role?.toUpperCase() !== "PATIENT") {
        router.replace(getDashboardPath(user.role));
        return;
      }

      const status = await getPatientProfileStatus(getAccessToken()!);

      if (cancelled) return;

      if (status === "unauthorized") {
        handleSessionExpired();
        return;
      }

      if (status === "error") {
        setGuardError(
          "Cannot verify your medical profile. Make sure the backend is running, then refresh this page.",
        );
        setProfileComplete(false);
        setReady(true);
        return;
      }

      setProfileComplete(status === "complete");
      setReady(true);
    }

    void verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const meta = PAGE_META[pathname] ?? {
    title: "Patient",
    subtitle: "Diabetes Management System",
  };

  const isProfileRoute =
    pathname === "/patient/profile" || pathname === "/patient/medical-profile";

  if (!ready) {
    return (
      <DashboardShell
        role="patient"
        title={meta.title ?? ""}
        subtitle={meta.subtitle}
      >
        <p className="text-sm text-zinc-500">Loading…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="patient"
      title={meta.title ?? ""}
      subtitle={meta.subtitle}
    >
      {guardError && (
        <ApiMessage message={guardError} variant="info" className="mb-4" />
      )}
      {children}
      <PatientMedicalSetupModal
        open={!profileComplete && !isProfileRoute}
        onComplete={() => setProfileComplete(true)}
      />
    </DashboardShell>
  );
}
