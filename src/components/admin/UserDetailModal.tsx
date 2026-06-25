"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import {
  getNetworkErrorMessage,
  isApiSuccess,
  resolveApiError,
} from "@/helper/apiErrors";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import ApiMessage from "@/components/ui/ApiMessage";
import { normalizeUserDetail, type AdminUser } from "@/types/admin";

type UserDetailModalProps = {
  userId: number | null;
  onClose: () => void;
};

export default function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function load() {
      setLoading(true);
      setError(null);

      const id = userId;
      if (!id) return;

      try {
        const response = await apiGetCall({
          endpoint: "user_by_id",
          pathParams: { userId: id },
          token: getAccessToken() ?? undefined,
        });

        if (!isApiSuccess(response.status)) {
          setError(resolveApiError(response, "Failed to load user."));
          return;
        }

        setUser(normalizeUserDetail(response.data));
      } catch (error) {
        setError(getNetworkErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [userId]);

  if (!userId) return null;

  const fields = user
    ? [
        { label: "User ID", value: String(user.userId) },
        { label: "Name", value: `${user.firstName} ${user.lastName}` },
        { label: "Email", value: user.email },
        { label: "Role", value: user.role },
        { label: "Status", value: user.isActive },
        { label: "Mobile", value: user.mobileNumber },
        { label: "Gender", value: user.gender },
        { label: "Address", value: user.address },
        { label: "Joined", value: user.createdAt },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-zinc-900/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-teal-100 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-teal-800">User details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-teal-50"
          >
            <XIcon size={20} />
          </button>
        </div>

        {loading && <p className="mt-6 text-sm text-zinc-500">Loading…</p>}
        {error && <ApiMessage message={error} className="mt-6" />}

        {!loading && !error && user && (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {field.label}
                </dt>
                <dd className="mt-1 text-sm font-medium capitalize text-zinc-800">
                  {field.value ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
