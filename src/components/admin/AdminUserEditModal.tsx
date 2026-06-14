"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import {
  getNetworkErrorMessage,
  isApiSuccess,
  resolveApiError,
} from "@/helper/apiErrors";
import { apiGetCall, apiPatchCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import ApiMessage from "@/components/ui/ApiMessage";
import { Select } from "@/components/ui/select";
import { normalizeUserDetail, type AdminUser } from "@/types/admin";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "BLOCKED"] as const;
const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"] as const;

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
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    address: "",
    gender: "MALE",
    isActive: "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadUser() {
      setLoading(true);
      setError(null);

      try {
        const response = await apiGetCall({
          endpoint: "user_by_id",
          pathParams: { userId: user!.userId },
          token: getAccessToken() ?? undefined,
        });

        if (!isApiSuccess(response.status)) {
          setError(resolveApiError(response, "Failed to load user."));
          return;
        }

        const detail = normalizeUserDetail(response.data);
        if (!detail) {
          setError("Failed to load user.");
          return;
        }

        setForm({
          firstName: detail.firstName ?? "",
          lastName: detail.lastName ?? "",
          mobileNumber: detail.mobileNumber ?? "",
          address: detail.address ?? "",
          gender: detail.gender ?? "MALE",
          isActive: detail.isActive ?? "ACTIVE",
        });
      } catch (loadError) {
        setError(getNetworkErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, [user]);

  if (!user) return null;

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!user) return;

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    if (!/^[0-9]{7,15}$/.test(form.mobileNumber.trim())) {
      setError("Mobile number must be 7–15 digits.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await apiPatchCall({
        endpoint: "admin_update_user",
        pathParams: { userId: user.userId },
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        address: form.address.trim() || undefined,
        gender: form.gender,
        isActive: form.isActive,
        token: getAccessToken() ?? undefined,
      });

      if (!isApiSuccess(response.status)) {
        setError(resolveApiError(response, "Failed to update user."));
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
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-teal-100 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-teal-800">Edit user</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {user.firstName} {user.lastName} · {user.email}
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {loading ? (
            <p className="sm:col-span-2 text-sm text-zinc-500">Loading user details…</p>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  First name
                </label>
                <input
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Last name
                </label>
                <input
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Mobile
                </label>
                <input
                  value={form.mobileNumber}
                  onChange={(e) => updateField("mobileNumber", e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Gender
                </label>
                <Select
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Address
                </label>
                <input
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Account status
                </label>
                <Select
                  value={form.isActive}
                  onChange={(e) => updateField("isActive", e.target.value)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}
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
            disabled={saving || loading}
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
