"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardHero, { getTimeGreeting } from "@/components/dashboard/DashboardHero";
import ApiMessage from "@/components/ui/ApiMessage";
import StatCard from "@/components/admin/StatCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import {
  fetchDoctorProfessionalDetails,
  getCachedDoctorProfessionalDetails,
} from "@/lib/doctorProfessionalApi";
import { formatWeekDay } from "@/lib/doctorForm";
import { getAccessToken, getStoredUser } from "@/lib/auth";
import { loadMyBookingsSafe } from "@/lib/myBookings";
import type { Booking } from "@/types/booking";
import type { DoctorProfessionalDetails } from "@/types/doctorProfessional";
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  StethoscopeIcon,
  PrescriptionIcon,
  BookOpenIcon,
  UserCircleIcon,
  IdentificationCardIcon,
  BriefcaseIcon,
} from "@phosphor-icons/react";

function DoctorProfileSummary({
  profile,
  error,
  displayName,
}: {
  profile: DoctorProfessionalDetails | null;
  error: string | null;
  displayName: string;
}) {
  if (error) {
    return <ApiMessage message={error} variant="error" />;
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-amber-900">Professional profile required</h2>
        <p className="mt-2 text-sm text-amber-800">
          Add your license, specialization, and availability before patients can book appointments with you.
        </p>
        <Link
          href="/doctor/profile"
          className="mt-4 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
        >
          Complete professional profile
        </Link>
      </div>
    );
  }

  const availableDays =
    profile.availableDays?.map(formatWeekDay).join(", ") ?? "—";

  const initials = displayName
    .replace(/^dr\.?\s*/i, "")
    .trim()
    .substring(0, 2)
    .toUpperCase();

  return (
    <section className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm space-y-6">
      {/* Profile Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-800">Professional Profile</h2>
          <p className="text-xs text-zinc-500">Overview of your practice details</p>
        </div>
        <Link
          href="/doctor/profile"
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition hover:underline"
        >
          Edit Profile →
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Professional Avatar & Identity */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left p-6 rounded-xl bg-slate-50 border border-slate-100 lg:w-1/3 justify-center">
          <div className="w-20 h-20 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {initials || "DR"}
          </div>
          <h3 className="mt-4 text-xl font-bold text-zinc-800">{displayName}</h3>
          <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-teal-600">
            <StethoscopeIcon size={16} />
            {profile.specialization || "General Medicine"}
          </span>
          <p className="text-xs text-zinc-400 mt-1">{profile.qualification || "Medical Practitioner"}</p>
          
          {profile.biography && (
            <div className="mt-4 border-t border-zinc-200/60 pt-4 w-full">
              <p className="text-xs italic text-zinc-500 line-clamp-3">
                &ldquo;{profile.biography}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Metadata Cards */}
        <div className="flex-1 grid gap-4 sm:grid-cols-2">
          {[
            {
              label: "License Number",
              value: profile.licenseNumber,
              icon: IdentificationCardIcon,
              color: "text-blue-500 bg-blue-50",
            },
            {
              label: "Experience",
              value: profile.yearsOfExperience != null ? `${profile.yearsOfExperience} Year(s)` : "—",
              icon: BriefcaseIcon,
              color: "text-indigo-500 bg-indigo-50",
            },
            {
              label: "Consultation Fee",
              value: profile.consultationFee != null ? `Rs. ${profile.consultationFee}` : "—",
              icon: CurrencyDollarIcon,
              color: "text-emerald-500 bg-emerald-50",
            },
            {
              label: "Working Hours",
              value: profile.availableFrom && profile.availableTo ? `${profile.availableFrom} – ${profile.availableTo}` : "—",
              icon: ClockIcon,
              color: "text-amber-500 bg-amber-50",
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 transition bg-white">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                <item.icon size={20} weight="duotone" />
              </span>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {item.label}
                </dt>
                <dd className="mt-0.5 text-sm font-bold text-zinc-800">
                  {item.value}
                </dd>
              </div>
            </div>
          ))}

          {/* Full-width Available Days Card */}
          <div className="sm:col-span-2 flex items-center gap-3 p-4 rounded-xl border border-zinc-100 bg-white">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-teal-600 bg-teal-50">
              <CalendarIcon size={20} weight="duotone" />
            </span>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Available Days
              </dt>
              <dd className="mt-0.5 text-sm font-bold text-zinc-800">
                {availableDays}
              </dd>
            </div>
          </div>
        </div>
      </div>
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

  // Added Bookings fetching state for stats
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // 1. Load profile if not in cache
      if (!initialCache) {
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

      // 2. Fetch bookings
      const token = getAccessToken();
      if (token) {
        const bookingsResult = await loadMyBookingsSafe(token);
        if (bookingsResult.ok) {
          setBookings(bookingsResult.data);
        }
      }
      setBookingsLoading(false);
    }

    void loadData();
  }, [initialCache]);

  if (loading || bookingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-zinc-500 animate-pulse">Loading doctor dashboard overview…</p>
      </div>
    );
  }

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="space-y-8">
      <DashboardHero
        greeting={getTimeGreeting()}
        name={displayName}
        description="Manage your profile, write recommendations, issue prescriptions, and check pending appointments."
      />

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={bookings.length}
          icon={CalendarIcon}
          accent="teal"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingCount}
          icon={ClockIcon}
          accent="amber"
        />
        <StatCard
          label="Consultation Fee"
          value={profile?.consultationFee != null ? `Rs. ${profile.consultationFee}` : "—"}
          icon={CurrencyDollarIcon}
          accent="emerald"
        />
        <StatCard
          label="Average Rating"
          value={profile?.averageRating != null ? `${profile.averageRating} / 5` : "New"}
          icon={StarIcon}
          accent="sky"
        />
      </div>

      {/* Quick Actions Panel */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            href="/doctor/bookings"
            title="Appointments"
            description="Approve, deny, and review booking requests."
            icon={CalendarIcon}
          />
          <QuickActionCard
            href="/doctor/Prescription"
            title="Prescriptions"
            description="Manage and issue patient prescriptions."
            icon={PrescriptionIcon}
          />
          <QuickActionCard
            href="/doctor/Recommendation"
            title="Recommendations"
            description="Diet plans, advice, and lifestyle tips."
            icon={BookOpenIcon}
          />
          <QuickActionCard
            href="/doctor/profile"
            title="Edit Profile"
            description="Adjust fees, timings, and credentials."
            icon={UserCircleIcon}
          />
        </div>
      </div>

      {/* Profile Detail Block */}
      <DoctorProfileSummary profile={profile} error={profileError} displayName={displayName} />
    </div>
  );
}
