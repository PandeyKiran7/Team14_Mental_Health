"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import BookingsPanel from "@/components/booking/BookingsPanel";
import { getAccessToken } from "@/lib/auth";
import { doctorHasProfile } from "@/lib/doctorProfile";

export default function DoctorBookingsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function guard() {
      const token = getAccessToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      const hasProfile = await doctorHasProfile(token);
      if (!hasProfile) {
        router.replace("/doctor/profile");
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
      subtitle="Review requests, approve bookings, and add prescriptions"
    >
      <BookingsPanel />
    </DashboardShell>
  );
}
