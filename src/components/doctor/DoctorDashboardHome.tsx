"use client";

import Link from "next/link";
import DoctorPendingAppointments from "@/components/doctor/DoctorPendingAppointments";
import PatientMedicalLookup from "@/components/doctor/PatientMedicalLookup";
import { useEffect, useState } from "react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { extractApiEntity } from "@/helper/apiResponse";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";

type DoctorData = {
  specialization?: string;
  qualification?: string;
  consultationFee?: number;
  availableFrom?: string;
  availableTo?: string;
  availableDays?: string[];
};

type ApiBody<T> = {
  success: boolean;
  data?: T;
};

export default function DoctorDashboardHome() {
  const [profile, setProfile] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = getAccessToken();
        const response = await apiGetCall({
          endpoint: "doctor_data",
          token: token ?? undefined,
        });

        if (response.status === API_CONSTANTS.success) {
          setProfile(
            extractApiEntity<DoctorData>(response.data, "licenseNumber"),
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
          Your professional profile is set up. Manage appointments and patients from here.
        </p>
      </div>

      {profile && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-teal-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
              Specialization
            </p>
            <p className="mt-1 font-semibold text-zinc-800">
              {profile.specialization ?? "—"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">{profile.qualification}</p>
          </div>
          <div className="rounded-xl border border-teal-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
              Availability
            </p>
            <p className="mt-1 font-semibold text-zinc-800">
              {profile.availableFrom} – {profile.availableTo}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Fee: {profile.consultationFee ?? "—"}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/doctor/bookings"
          className="inline-flex rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Appointments
        </Link>
        <Link
          href="/doctor/profile"
          className="inline-flex rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          Edit profile
        </Link>
      </div>

      <DoctorPendingAppointments />
      <PatientMedicalLookup />
    </div>
  );
}
