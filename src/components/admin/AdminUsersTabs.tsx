"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AdminDoctorsPanel from "@/components/admin/AdminDoctorsPanel";
import AdminPatientsPanel from "@/components/admin/AdminPatientsPanel";
import UsersTable, { useAdminUsers } from "@/components/admin/UsersTable";
import { cn } from "@/lib/utils";

export type UsersTab = "all" | "patients" | "doctors";

const TABS: { id: UsersTab; label: string }[] = [
  { id: "all", label: "All users" },
  { id: "patients", label: "Patients" },
  { id: "doctors", label: "Doctors" },
];

function parseTab(value: string | null): UsersTab {
  if (value === "patients" || value === "doctors") return value;
  return "all";
}

export default function AdminUsersTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));
  const { users, loading, error, reload } = useAdminUsers();

  const counts = useMemo(
    () => ({
      all: users.length,
      patients: users.filter((u) => u.role.toLowerCase() === "patient").length,
      doctors: users.filter((u) => u.role.toLowerCase() === "doctor").length,
    }),
    [users],
  );

  function selectTab(tab: UsersTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200">
        <div className="flex flex-wrap gap-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = counts[tab.id];

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectTab(tab.id)}
                className={cn(
                  "-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm transition",
                  isActive
                    ? "border-zinc-900 font-semibold text-zinc-900"
                    : "border-transparent font-medium text-zinc-500 hover:text-zinc-700",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                    isActive
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-200 text-zinc-600",
                  )}
                >
                  {loading ? "—" : count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "all" && (
        <UsersTable
          users={users}
          loading={loading}
          error={error}
          onUsersChange={reload}
        />
      )}
      {activeTab === "patients" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Link
              href="/admin/users/register/patient"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Register patient
            </Link>
          </div>
          <AdminPatientsPanel hideRegisterLink />
        </div>
      )}
      {activeTab === "doctors" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Link
              href="/admin/users/register/doctor"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Register doctor
            </Link>
          </div>
          <AdminDoctorsPanel hideRegisterLink />
        </div>
      )}
    </div>
  );
}
