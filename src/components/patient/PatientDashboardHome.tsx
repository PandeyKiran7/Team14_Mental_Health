"use client";

import Link from "next/link";
import {
  CalendarIcon,
  DropIcon,
  HeartbeatIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import DashboardHero, { getTimeGreeting } from "@/components/dashboard/DashboardHero";
import StatCard from "@/components/admin/StatCard";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { isApiSuccess } from "@/helper/apiErrors";
import { extractApiEntity } from "@/helper/apiResponse";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken, getStoredUser } from "@/lib/auth";
import { normalizeBookings } from "@/types/booking";

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
  const user = getStoredUser();
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : "Patient";

  const [profile, setProfile] = useState<PatientMedicalData | null>(null);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [profileRes, bookingsRes] = await Promise.all([
          apiGetCall({ endpoint: "patient_medical_data", token }),
          apiGetCall({ endpoint: "bookings", token }),
        ]);

        if (profileRes.status === API_CONSTANTS.success) {
          setProfile(
            extractApiEntity<PatientMedicalData>(profileRes.data, "diabetesType"),
          );
        }

        if (isApiSuccess(bookingsRes.status)) {
          const bookings = normalizeBookings(bookingsRes.data);
          setAppointmentCount(bookings.length);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading overview…</p>;
  }

  return (
    <div className="space-y-8">
      <DashboardHero
        greeting={getTimeGreeting()}
        name={displayName}
        description="Track your glucose targets, book doctor visits, and keep your medical profile up to date — all in one place."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Diabetes type"
          value={profile?.diabetesType ?? "—"}
          icon={DropIcon}
          accent="teal"
        />
        <StatCard
          label="Glucose target"
          value={
            profile?.targetGlucoseMin != null && profile?.targetGlucoseMax != null
              ? `${profile.targetGlucoseMin}–${profile.targetGlucoseMax}`
              : "—"
          }
          icon={HeartbeatIcon}
          accent="emerald"
        />
        <StatCard
          label="Appointments"
          value={appointmentCount}
          icon={CalendarIcon}
          accent="sky"
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>

      {profile && (
        <section className="rounded-xl border border-teal-100 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-teal-800">Health snapshot</h3>
            <Link
              href="/patient/medical-profile"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
            >
              Edit profile →
            </Link>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Blood group", value: profile.bloodGroup },
              { label: "Height", value: profile.heightCM ? `${profile.heightCM} cm` : undefined },
              { label: "Weight", value: profile.weightKG ? `${profile.weightKG} kg` : undefined },
              {
                label: "Activity",
                value: profile.activityLevel?.toLowerCase(),
              },
              {
                label: "Diet",
                value: profile.dietaryPreference?.replace(/_/g, " ").toLowerCase(),
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-slate-50 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold capitalize text-zinc-800">
                  {item.value ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
