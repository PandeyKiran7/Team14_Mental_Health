"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import {
  getNetworkErrorMessage,
  isApiSuccess,
  resolveAdminMutationError,
  resolveApiError,
} from "@/helper/apiErrors";
import { apiPatchCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import type { AdminUser } from "@/types/admin";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "BLOCKED"] as const;

type UserStatusModalProps = {
  user: AdminUser | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function UserStatusModal({
  user,
  onClose,
  onUpdated,
}: UserStatusModalProps) {
  const [status, setStatus] = useState(user?.isActive ?? "ACTIVE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setStatus(user.isActive);
  }, [user]);

  if (!user) return null;

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const response = await apiPatchCall({
        endpoint: "user_status",
        pathParams: { userId: user!.userId },
        isActive: status,
        token: getAccessToken() ?? undefined,
      });

      if (!isApiSuccess(response.status)) {
        setError(
          resolveAdminMutationError(response, "Failed to update status."),
        );
        return;
      }

      onUpdated();
      onClose();
    } catch {
      setError("Cannot reach backend.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-zinc-900/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-teal-100 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-teal-800">Update status</h2>
            <p className="mt-1 text-sm text-zinc-500">
              User ID: {user.userId} · {user.firstName} {user.lastName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-teal-50"
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className="mt-6">
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Account status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save status"}
          </button>
        </div>
      </div>
    </div>
  );
}
