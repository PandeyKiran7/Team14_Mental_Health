"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  return <BookingsPanel showBookForm />;
}
