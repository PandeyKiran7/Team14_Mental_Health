"use client";

import Link from "next/link";
import {
  ChartLineUpIcon,
  StethoscopeIcon,
  UserCircleIcon,
  UserPlusIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import DashboardHero, { getTimeGreeting } from "@/components/dashboard/DashboardHero";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import StatCard from "@/components/admin/StatCard";
import UsersTable, { useAdminUsers } from "@/components/admin/UsersTable";
import { getStoredUser } from "@/lib/auth";

export default function AdminDashboardPage() {
  const { users, loading, error } = useAdminUsers();
  const admin = getStoredUser();
  const displayName = admin?.firstName
    ? `${admin.firstName} ${admin.lastName ?? ""}`.trim()
    : "Admin";

  const patientCount = users.filter(
    (u) => u.role.toLowerCase() === "patient",
  ).length;
  const doctorCount = users.filter(
    (u) => u.role.toLowerCase() === "doctor",
  ).length;
  const adminCount = users.filter(
    (u) => u.role.toLowerCase() === "admin",
  ).length;
  const activeCount = users.filter((u) => u.isActive === "ACTIVE").length;

  return (
    <div className="space-y-8">
      <DashboardHero
        greeting={getTimeGreeting()}
        name={displayName}
        description="Monitor platform activity, manage users, and keep doctors and patients connected across the diabetes care system."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={loading ? "—" : users.length}
          icon={UsersIcon}
          accent="teal"
        />
        <StatCard
          label="Patients"
          value={loading ? "—" : patientCount}
          icon={UserCircleIcon}
          accent="emerald"
        />
        <StatCard
          label="Doctors"
          value={loading ? "—" : doctorCount}
          icon={StethoscopeIcon}
          accent="sky"
        />
        <StatCard
          label="Active accounts"
          value={loading ? "—" : activeCount}
          icon={ChartLineUpIcon}
          accent="amber"
        />
      </div>

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Quick actions
        </h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard
            href="/admin/users"
            title="Manage users"
            description={`${users.length} registered accounts across all roles`}
            icon={UsersIcon}
          />
          <QuickActionCard
            href="/admin/doctors/register"
            title="Register doctor"
            description="Create a new doctor account for the platform"
            icon={UserPlusIcon}
          />
          <QuickActionCard
            href="/admin/doctors"
            title="Doctor management"
            description={`${doctorCount} doctors · ${adminCount} admins`}
            icon={StethoscopeIcon}
          />
        </div>
      </section>

      <section className="rounded-xl border border-teal-100 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-teal-800">Recent users</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Latest registrations and account activity
            </p>
          </div>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        <UsersTable compact users={users} loading={loading} error={error} />
      </section>
    </div>
  );
}
