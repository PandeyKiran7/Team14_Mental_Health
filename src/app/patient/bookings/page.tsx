"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import BookingsPanel from "@/components/booking/BookingsPanel";
import { getAccessToken } from "@/lib/auth";
import { patientHasProfile } from "@/lib/patientProfile";

export default function PatientBookingsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function guard() {
      const token = getAccessToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      const hasProfile = await patientHasProfile(token);
      if (!hasProfile) {
        router.replace("/patient/profile");
        return;
      }

      setChecking(false);
    }

    void guard();
  }, [router]);

  if (checking) {
    return (
      <DashboardShell title="Appointments" subtitle="Loading…">
        <p className="mt-6 text-sm text-zinc-500">Loading…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Appointments"
      subtitle="Book and manage your doctor appointments"
    >
      <BookingsPanel showBookForm />
    </DashboardShell>
  );
}
