"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import {
  getNetworkErrorMessage,
  isApiSuccess,
  resolveAdminMutationError,
} from "@/helper/apiErrors";
import { apiPatchCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import ApiMessage from "@/components/ui/ApiMessage";
import { Select } from "@/components/ui/select";
import type { AdminUser } from "@/types/admin";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"] as const;

type AdminUserEditModalProps = {
  user: AdminUser | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function AdminUserEditModal({
  user,
  onClose,
  onUpdated,
}: AdminUserEditModalProps) {
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setStatus(user.isActive === "INACTIVE" ? "INACTIVE" : "ACTIVE");
    setError(null);
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
        setError(resolveAdminMutationError(response, "Failed to update status."));
        return;
      }

      onUpdated();
      onClose();
    } catch (saveError) {
      setError(getNetworkErrorMessage(saveError));
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
          <p className="text-sm text-zinc-600">
            {user.firstName} {user.lastName} · {user.email}
          </p>
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
          <Select value={status} onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        {error && <ApiMessage message={error} className="mt-4" />}

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
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
