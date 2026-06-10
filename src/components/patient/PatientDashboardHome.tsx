"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { extractApiEntity } from "@/helper/apiResponse";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";

type PatientMedicalData = {
  diabetesType?: string;
  bloodGroup?: string;
  heightCM?: number;
  weightKG?: number;
  targetGlucoseMin?: number;
  targetGlucoseMax?: number;
  activityLevel?: string;
  dietaryPreference?: string;
};

export default function PatientDashboardHome() {
  const [profile, setProfile] = useState<PatientMedicalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = getAccessToken();
        const response = await apiGetCall({
          endpoint: "patient_medical_data",
          token: token ?? undefined,
        });

        if (response.status === API_CONSTANTS.success) {
          setProfile(
            extractApiEntity<PatientMedicalData>(response.data, "diabetesType"),
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  if (loading) {
    return <p className="mt-6 text-sm text-zinc-500">Loading dashboard…</p>;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-teal-800">Welcome back</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Your medical profile is set up. Track your health and manage care from here.
        </p>
      </div>

      {profile && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-teal-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
              Diabetes type
            </p>
            <p className="mt-1 font-semibold text-zinc-800">
              {profile.diabetesType ?? "—"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Blood group: {profile.bloodGroup ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-teal-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
              Health targets
            </p>
            <p className="mt-1 font-semibold text-zinc-800">
              Glucose {profile.targetGlucoseMin ?? "—"} – {profile.targetGlucoseMax ?? "—"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {profile.heightCM ?? "—"} cm · {profile.weightKG ?? "—"} kg ·{" "}
              {profile.activityLevel?.toLowerCase() ?? "—"} activity
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/patient/bookings"
          className="inline-flex rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Appointments
        </Link>
        <Link
          href="/patient/profile"
          className="inline-flex rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          Edit medical profile
        </Link>
      </div>
    </div>
  );
}
