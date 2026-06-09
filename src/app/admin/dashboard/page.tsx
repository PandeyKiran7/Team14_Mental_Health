"use client";

import Link from "next/link";
import {
  StethoscopeIcon,
  UserCircleIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import StatCard from "@/components/admin/StatCard";
import UsersTable, { useAdminUsers } from "@/components/admin/UsersTable";

export default function AdminDashboardPage() {
  const { users, loading, error } = useAdminUsers();

  const patientCount = users.filter(
    (u) => u.role.toLowerCase() === "patient",
  ).length;
  const doctorCount = users.filter(
    (u) => u.role.toLowerCase() === "doctor",
  ).length;
  const adminCount = users.filter(
    (u) => u.role.toLowerCase() === "admin",
  ).length;

  return (
    <>
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
          label="Admins"
          value={loading ? "—" : adminCount}
          icon={UsersIcon}
          accent="amber"
        />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-teal-800">Recent users</h2>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        <UsersTable compact users={users} loading={loading} error={error} />
      </section>
    </>
  );
}
