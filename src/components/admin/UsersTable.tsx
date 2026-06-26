"use client";

import { useCallback, useEffect, useState } from "react";
import { EyeIcon, PencilIcon } from "@phosphor-icons/react";
import { apiGetCall } from "@/helper/apiService";
import {
  getNetworkErrorMessage,
  isApiSuccess,
  resolveApiError,
} from "@/helper/apiErrors";
import { getAccessToken } from "@/lib/auth";
import { normalizeUsers, type AdminUser } from "@/types/admin";
import { cn } from "@/lib/utils";
import AdminUserEditModal from "@/components/admin/AdminUserEditModal";
import UserDetailModal from "@/components/admin/UserDetailModal";
import UserStatusModal from "@/components/admin/UserStatusModal";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  doctor: "bg-sky-100 text-sky-700",
  patient: "bg-emerald-100 text-emerald-700",
  content_manager: "bg-amber-100 text-amber-700",
  internal_manager: "bg-amber-100 text-amber-700",
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
  onUsersChange?: () => void;
};

export default function UsersTable({
  compact = false,
  users: externalUsers,
  loading: externalLoading,
  error: externalError,
  onUsersChange,
}: UsersTableProps) {
  const fetched = useAdminUsers(externalUsers === undefined);
  const users = externalUsers ?? fetched.users;
  const loading = externalLoading ?? fetched.loading;
  const error = externalError ?? fetched.error;
  const reload = fetched.reload;

  const [viewUserId, setViewUserId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null);

  const refresh = useCallback(() => {
    reload();
    onUsersChange?.();
  }, [reload, onUsersChange]);

  if (loading) {
    return (
      <div className="rounded-xl border border-teal-100 bg-white p-8">
        <p className="text-center text-sm text-zinc-500">Loading users…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-teal-100 bg-white p-8 text-center">
        <p className="text-sm text-zinc-500">No users found.</p>
      </div>
    );
  }

  const displayUsers = compact ? users.slice(0, 5) : users;
  const showActions = !compact;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-teal-100 bg-white">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-teal-100 bg-teal-50/60">
                <th className="px-4 py-3 font-semibold text-teal-900">User ID</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Name</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Email</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Role</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Status</th>
                {showActions && (
                  <th className="px-4 py-3 font-semibold text-teal-900">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayUsers.map((user) => (
                <tr
                  key={user.userId}
                  className="border-b border-teal-50 last:border-0 hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{user.userId}</td>
                  <td className="px-4 py-3 font-medium text-zinc-800">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    {showActions ? (
                      <button
                        type="button"
                        title="Update status"
                        onClick={() => setStatusTarget(user)}
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium hover:opacity-80",
                          user.isActive === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-zinc-100 text-zinc-500",
                        )}
                      >
                        {user.isActive}
                      </button>
                    ) : (
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
                    )}
                  </td>
                  {showActions && (
                    <td className="px-4 py-3 text-zinc-500">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="View details"
                          onClick={() => setViewUserId(user.userId)}
                          className="cursor-pointer rounded border border-teal-200 p-2 hover:bg-teal-50"
                        >
                          <EyeIcon size={16} className="text-teal-800" />
                        </button>
                        <button
                          type="button"
                          title="Set account status"
                          onClick={() => setEditTarget(user)}
                          className="cursor-pointer rounded border border-teal-200 p-2 hover:bg-teal-50"
                        >
                          <PencilIcon size={16} className="text-teal-800" />
                        </button>
                      </div>
                    </td>
                  )}
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

      {showActions && (
        <>
          <UserDetailModal userId={viewUserId} onClose={() => setViewUserId(null)} />
          <AdminUserEditModal
            user={editTarget}
            onClose={() => setEditTarget(null)}
            onUpdated={refresh}
          />
          <UserStatusModal
            user={statusTarget}
            onClose={() => setStatusTarget(null)}
            onUpdated={refresh}
          />
        </>
      )}
    </>
  );
}

export function useAdminUsers(enabled = true) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((n) => n + 1), []);

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

        if (!isApiSuccess(response.status)) {
          setError(resolveApiError(response, "Failed to load users."));
          setUsers([]);
          return;
        }

        setUsers(normalizeUsers(response.data));
      } catch (error) {
        setError(getNetworkErrorMessage(error));
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    void fetchUsers();
  }, [enabled, tick]);

  return { users, loading, error, reload };
}
