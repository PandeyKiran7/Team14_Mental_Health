"use client";

import {
  ChartLineUpIcon,
  StethoscopeIcon,
  UserCircleIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import StatCard from "@/components/admin/StatCard";
import { useAdminUsers } from "@/components/admin/UsersTable";
import ApiMessage from "@/components/ui/ApiMessage";

export default function AdminMonitoringPanel() {
  const { users, loading, error } = useAdminUsers();

  const patientCount = users.filter((u) => u.role.toLowerCase() === "patient").length;
  const doctorCount = users.filter((u) => u.role.toLowerCase() === "doctor").length;
  const activeCount = users.filter((u) => u.isActive === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {error && <ApiMessage message={error} variant="error" />}

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
    </div>
  );
}
