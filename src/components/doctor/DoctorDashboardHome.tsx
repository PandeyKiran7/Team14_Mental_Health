"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DoctorPendingAppointments from "@/components/doctor/DoctorPendingAppointments";
import DashboardHero, { getTimeGreeting } from "@/components/dashboard/DashboardHero";
import ApiMessage from "@/components/ui/ApiMessage";
import {
  fetchDoctorProfessionalDetails,
  getCachedDoctorProfessionalDetails,
} from "@/lib/doctorProfessionalApi";
import { formatWeekDay } from "@/lib/doctorForm";
import { getStoredUser } from "@/lib/auth";
import type { DoctorProfessionalDetails } from "@/types/doctorProfessional";

function DoctorProfileSummary({
  profile,
  error,
}: {
  profile: DoctorProfessionalDetails | null;
  error: string | null;
}) {
  if (error) {
    return <ApiMessage message={error} variant="error" />;
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-900">Professional profile required</h2>
        <p className="mt-2 text-sm text-amber-800">
          Add your license, specialization, and availability via{" "}
          <code className="rounded bg-white/80 px-1">POST /api/v1/doctor-data</code> before
          patients can book with you.
        </p>
        <Link
          href="/doctor/profile"
          className="mt-4 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Complete professional profile
        </Link>
      </div>
    );
  }

  const availableDays =
    profile.availableDays?.map(formatWeekDay).join(", ") ?? "—";

  return (
    <section className="rounded-xl border border-teal-100 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-teal-800">Professional profile</h2>
        <Link
          href="/doctor/profile"
          className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
        >
          Edit profile
        </Link>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "License", value: profile.licenseNumber },
          { label: "Qualification", value: profile.qualification },
          { label: "Specialization", value: profile.specialization },
          {
            label: "Experience",
            value:
              profile.yearsOfExperience != null
                ? `${profile.yearsOfExperience} year(s)`
                : undefined,
          },
          {
            label: "Consultation fee",
            value:
              profile.consultationFee != null ? `Rs. ${profile.consultationFee}` : undefined,
          },
          {
            label: "Working hours",
            value:
              profile.availableFrom && profile.availableTo
                ? `${profile.availableFrom} – ${profile.availableTo}`
                : undefined,
          },
          { label: "Available days", value: availableDays },
          {
            label: "Rating",
            value: profile.averageRating != null ? String(profile.averageRating) : undefined,
          },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-800">{item.value ?? "—"}</dd>
          </div>
        ))}
      </dl>

      {profile.biography && (
        <p className="mt-4 text-sm text-zinc-600">{profile.biography}</p>
      )}
    </section>
  );
}

export default function DoctorDashboardHome() {
  const user = getStoredUser();
  const displayName = user?.firstName
    ? `Dr. ${user.firstName} ${user.lastName ?? ""}`.trim()
    : "Doctor";

  const initialCache = getCachedDoctorProfessionalDetails();
  const [profile, setProfile] = useState<DoctorProfessionalDetails | null>(
    initialCache?.ok ? initialCache.data : null,
  );
  const [profileError, setProfileError] = useState<string | null>(
    initialCache && !initialCache.ok ? initialCache.message : null,
  );
  const [loading, setLoading] = useState(!initialCache);

  useEffect(() => {
    if (initialCache) return;

    async function loadProfile() {
      const result = await fetchDoctorProfessionalDetails();

      if (!result.ok) {
        setProfileError(result.message);
        setProfile(null);
      } else {
        setProfileError(null);
        setProfile(result.data);
      }

      setLoading(false);
    }

    void loadProfile();
  }, [initialCache]);

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-6">
      <DashboardHero
        greeting={getTimeGreeting()}
        name={displayName}
        description="Manage your profile, review appointments, and view patient details."
      />

      <DoctorProfileSummary profile={profile} error={profileError} />
      <DoctorPendingAppointments />
    </div>
  );
}
