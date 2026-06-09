"use client";

import { useEffect, useState } from "react";
import { apiGetCall } from "@/helper/apiService";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getAccessToken } from "@/lib/auth";
import { normalizeUsers, type AdminUser } from "@/types/admin";
import { cn } from "@/lib/utils";
import { EyeIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  doctor: "bg-sky-100 text-sky-700",
  patient: "bg-emerald-100 text-emerald-700",
};

function RoleBadge({ role }: { role: string }) {
  const key = role.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        ROLE_STYLES[key] ?? "bg-zinc-100 text-zinc-700",
      )}
    >
      {role}
    </span>
  );
}

type UsersTableProps = {
  compact?: boolean;
  users?: AdminUser[];
  loading?: boolean;
  error?: string | null;
};

export default function UsersTable({
  compact = false,
  users: externalUsers,
  loading: externalLoading,
  error: externalError,
}: UsersTableProps) {
  const fetched = useAdminUsers(externalUsers === undefined);
  const users = externalUsers ?? fetched.users;
  const loading = externalLoading ?? fetched.loading;
  const error = externalError ?? fetched.error;

  if (loading) {
    return (
      <div className="rounded-xl border border-teal-100 bg-white p-8 shadow-sm">
        <p className="text-center text-sm text-zinc-500">Loading users…</p>
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
        <p className="text-sm text-zinc-500">No users found.</p>
      </div>
    );
  }

  const displayUsers = compact ? users.slice(0, 5) : users;

  return (
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
            {displayUsers.map((user) => (
              <tr
                key={user.userId}
                className="border-b border-teal-50 last:border-0 hover:bg-slate-50/80"
              >
                <td className="px-4 py-3 font-medium text-zinc-800">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
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
                <td className="px-4 py-3 text-zinc-500">
                  <div className="flex items-center gap-3">
                  <button type="button" className="border border-teal-200 rounded p-2 cursor-pointer">
                  <EyeIcon size={16} className="text-teal-800" />
                    </button> 
                    <button type="button" className="border border-teal-200 rounded p-2 cursor-pointer">
                      <PencilIcon size={16} className="text-teal-800" />
                    </button>
                    <button type="button" className="border border-teal-200 rounded p-2 cursor-pointer">
                      <TrashIcon size={16} className="text-teal-800" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {compact && users.length > 5 && (
        <p className="border-t border-teal-100 px-4 py-3 text-xs text-zinc-500">
          Showing 5 of {users.length} users. View all in the Users section.
        </p>
      )}
    </div>
  );
}

export function useAdminUsers(enabled = true) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    async function fetchUsers() {
      setLoading(true);
      setError(null);

      try {
        const token = getAccessToken();
        const response = await apiGetCall({
          endpoint: "users",
          token: token ?? undefined,
        });

        if (response.status !== API_CONSTANTS.success) {
          const errData = response.data as { message?: string };
          setError(errData?.message ?? "Failed to load users.");
          setUsers([]);
          return;
        }

        // response.data is the full API body; normalizeUsers reads .message from it
        setUsers(normalizeUsers(response.data));
      } catch {
        setError("Cannot reach backend.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [enabled]);

  return { users, loading, error };
}