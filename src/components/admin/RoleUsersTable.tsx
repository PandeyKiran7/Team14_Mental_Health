"use client";

import { useCallback, useEffect, useState } from "react";
import { EyeIcon } from "@phosphor-icons/react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { normalizeUsers, type AdminUser } from "@/types/admin";
import UserDetailModal from "@/components/admin/UserDetailModal";
import type { API_ENDPOINTS } from "@/helper/apiList";

type RoleEndpoint = "patients" | "doctors" | "content_managers";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  doctor: "bg-sky-100 text-sky-700",
  patient: "bg-emerald-100 text-emerald-700",
  content_manager: "bg-amber-100 text-amber-700",
};

type RoleUsersTableProps = {
  endpoint: RoleEndpoint;
  emptyMessage?: string;
};

export default function RoleUsersTable({
  endpoint,
  emptyMessage = "No users found.",
}: RoleUsersTableProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewUserId, setViewUserId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGetCall({
        endpoint: endpoint as keyof typeof API_ENDPOINTS,
        token: getAccessToken() ?? undefined,
      });

      if (response.status !== API_CONSTANTS.success) {
        const errData = response.data as { message?: string };
        setError(errData?.message ?? "Failed to load users.");
        setUsers([]);
        return;
      }

      setUsers(normalizeUsers(response.data));
    } catch {
      setError("Cannot reach backend.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  if (loading) {
    return (
      <div className="rounded-xl border border-teal-100 bg-white p-8 shadow-sm">
        <p className="text-center text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-teal-100 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-teal-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-teal-100 bg-teal-50/60">
                <th className="px-4 py-3 font-semibold text-teal-900">Name</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Email</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Role</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Status</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.userId}
                  className="border-b border-teal-50 last:border-0 hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3 font-medium text-zinc-800">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        ROLE_STYLES[user.role.toLowerCase()] ?? "bg-zinc-100 text-zinc-700",
                      )}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        user.isActive === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-500",
                      )}
                    >
                      {user.isActive}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      title="View details"
                      onClick={() => setViewUserId(user.userId)}
                      className="cursor-pointer rounded border border-teal-200 p-2 hover:bg-teal-50"
                    >
                      <EyeIcon size={16} className="text-teal-800" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserDetailModal userId={viewUserId} onClose={() => setViewUserId(null)} />
    </>
  );
}
