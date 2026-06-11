"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDeleteCall, apiGetCall } from "@/helper/apiService";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { getAccessToken } from "@/lib/auth";
import { normalizeUsers, type AdminUser } from "@/types/admin";
import { cn } from "@/lib/utils";
import { EyeIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";
import UserDetailModal from "@/components/admin/UserDetailModal";
import UserStatusModal from "@/components/admin/UserStatusModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  doctor: "bg-sky-100 text-sky-700",
  patient: "bg-emerald-100 text-emerald-700",
  content_manager: "bg-amber-100 text-amber-700",
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
  const [statusUser, setStatusUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    reload();
    onUsersChange?.();
  }, [reload, onUsersChange]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    const user = deleteTarget;
    setDeletingId(user.userId);
    setActionError(null);

    try {
      const response = await apiDeleteCall({
        endpoint: "delete_user",
        pathParams: { userId: user.userId },
        token: getAccessToken() ?? undefined,
      });

      if (response.status !== API_CONSTANTS.success) {
        setActionError(getApiErrorMessage(response.data, "Failed to delete user."));
        return;
      }

      setDeleteTarget(null);
      refresh();
    } catch {
      setActionError("Cannot reach backend.");
    } finally {
      setDeletingId(null);
    }
  }

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
    <>
      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

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
                        title="Update status"
                        onClick={() => setStatusUser(user)}
                        className="cursor-pointer rounded border border-teal-200 p-2 hover:bg-teal-50"
                      >
                        <PencilIcon size={16} className="text-teal-800" />
                      </button>
                      <button
                        type="button"
                        title="Delete user"
                        disabled={deletingId === user.userId}
                        onClick={() => setDeleteTarget(user)}
                        className="cursor-pointer rounded border border-red-200 p-2 hover:bg-red-50 disabled:opacity-50"
                      >
                        <TrashIcon size={16} className="text-red-700" />
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

      <UserDetailModal userId={viewUserId} onClose={() => setViewUserId(null)} />
      <UserStatusModal
        user={statusUser}
        onClose={() => setStatusUser(null)}
        onUpdated={refresh}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete user?"
        message={
          deleteTarget
            ? `Delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (deletingId === null) setDeleteTarget(null);
        }}
      />
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
    }

    void fetchUsers();
  }, [enabled, tick]);

  return { users, loading, error, reload };
}
