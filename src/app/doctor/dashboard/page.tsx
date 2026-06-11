"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import DoctorDashboardHome from "@/components/doctor/DoctorDashboardHome";
import { getAccessToken } from "@/lib/auth";
import { doctorHasProfile } from "@/lib/doctorProfile";

export default function DoctorDashboardPage() {
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
      <DashboardShell title="Doctor Dashboard" subtitle="Loading…">
        <p className="mt-6 text-sm text-zinc-500">Loading dashboard…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Doctor Dashboard"
      subtitle="Overview of your practice and availability"
    >
      <DoctorDashboardHome />
    </DashboardShell>
  );
}
