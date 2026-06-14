"use client";

import Link from "next/link";
import {
  CalendarIcon,
  ClockIcon,
  CurrencyCircleDollarIcon,
  StethoscopeIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import DoctorPendingAppointments from "@/components/doctor/DoctorPendingAppointments";
import PatientMedicalLookup from "@/components/doctor/PatientMedicalLookup";
import DashboardHero, { getTimeGreeting } from "@/components/dashboard/DashboardHero";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import StatCard from "@/components/admin/StatCard";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { extractApiEntity } from "@/helper/apiResponse";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken, getStoredUser } from "@/lib/auth";
import { loadMyBookings } from "@/lib/myBookings";

type DoctorData = {
  specialization?: string;
  qualification?: string;
  consultationFee?: number;
  availableFrom?: string;
  availableTo?: string;
  availableDays?: string[];
};

export default function DoctorDashboardHome() {
  const user = getStoredUser();
  const displayName = user?.firstName
    ? `Dr. ${user.firstName} ${user.lastName ?? ""}`.trim()
    : "Doctor";

  const [profile, setProfile] = useState<DoctorData | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [profileRes, bookings] = await Promise.all([
          apiGetCall({ endpoint: "doctor_data", token }),
          loadMyBookings(token),
        ]);

        if (profileRes.status === API_CONSTANTS.success) {
          setProfile(extractApiEntity<DoctorData>(profileRes.data, "licenseNumber"));
        }

        setPendingCount(bookings.filter((b) => b.status === "PENDING").length);
        setConfirmedCount(bookings.filter((b) => b.status === "CONFIRMED").length);
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading overview…</p>;
  }

  const availableDays =
    profile?.availableDays
      ?.map((day) => day.charAt(0) + day.slice(1).toLowerCase())
      .join(", ") ?? "—";

  return (
    <div className="space-y-8">
      <DashboardHero
        greeting={getTimeGreeting()}
        name={displayName}
        description="Review appointment requests, manage your schedule, and access patient medical records from your practice dashboard."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Specialization"
          value={profile?.specialization ?? "—"}
          icon={StethoscopeIcon}
          accent="teal"
        />
        <StatCard
          label="Consultation fee"
          value={profile?.consultationFee != null ? `Rs. ${profile.consultationFee}` : "—"}
          icon={CurrencyCircleDollarIcon}
          accent="emerald"
        />
        <StatCard
          label="Pending requests"
          value={pendingCount}
          icon={CalendarIcon}
          accent="amber"
        />
        <StatCard
          label="Confirmed visits"
          value={confirmedCount}
          icon={ClockIcon}
          accent="sky"
        />
      </div>

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Quick actions
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <QuickActionCard
            href="/doctor/bookings"
            title="Manage appointments"
            description={
              pendingCount > 0
                ? `${pendingCount} patient request(s) need your response`
                : "View and manage all appointment bookings"
            }
            icon={CalendarIcon}
          />
          <QuickActionCard
            href="/doctor/profile"
            title="Professional profile"
            description="Update availability, fees, and qualifications"
            icon={UserCircleIcon}
          />
        </div>
      </section>

      {profile && (
        <section className="rounded-xl border border-teal-100 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-teal-800">Practice summary</h3>
            <Link
              href="/doctor/profile"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
            >
              Edit profile →
            </Link>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Qualification", value: profile.qualification },
              {
                label: "Working hours",
                value:
                  profile.availableFrom && profile.availableTo
                    ? `${profile.availableFrom} – ${profile.availableTo}`
                    : undefined,
              },
              { label: "Available days", value: availableDays },
              {
                label: "Weekly schedule",
                value: profile.availableDays?.length
                  ? `${profile.availableDays.length} day(s)`
                  : undefined,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-slate-50 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-800">
                  {item.value ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <DoctorPendingAppointments />
      <PatientMedicalLookup />
    </div>
  );
}
