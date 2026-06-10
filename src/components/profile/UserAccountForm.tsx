"use client";

import { useState } from "react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { extractApiEntity } from "@/helper/apiResponse";
import { apiPatchCall } from "@/helper/apiService";
import { getAccessToken, getStoredUser, setStoredUser } from "@/lib/auth";

type AccountFormState = {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  address: string;
  gender: string;
};

export default function UserAccountForm() {
  const stored = getStoredUser();
  const [form, setForm] = useState<AccountFormState>({
    firstName: stored?.firstName ?? "",
    lastName: stored?.lastName ?? "",
    mobileNumber: "",
    address: "",
    gender: "MALE",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!stored) return null;

  const isAdmin = stored.role?.toUpperCase() === "ADMIN";

  if (isAdmin) {
    return (
      <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-teal-800">Edit account</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Admin accounts cannot be updated via{" "}
          <code className="text-xs">PATCH /update/user</code> on the backend.
        </p>
      </div>
    );
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiPatchCall({
        endpoint: "update_user",
        firstName: form.firstName,
        lastName: form.lastName,
        mobileNumber: form.mobileNumber,
        address: form.address || undefined,
        gender: form.gender,
        token: getAccessToken() ?? undefined,
      });

      if (response.status !== API_CONSTANTS.success) {
        setError(getApiErrorMessage(response.data, "Failed to update account."));
        return;
      }

      const updated = extractApiEntity<{ firstName?: string; lastName?: string }>(
        response.data,
        "userId",
      );

      setStoredUser({
        ...stored,
        firstName: updated?.firstName ?? form.firstName,
        lastName: updated?.lastName ?? form.lastName,
      });

      setMessage("Account updated successfully.");
    } catch {
      setError("Cannot reach backend.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-teal-800">Edit account</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Update your personal details via{" "}
        <code className="text-xs">PATCH /update/user</code>.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              First name
            </label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Last name
            </label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Mobile number
          </label>
          <input
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={handleChange}
            required
            pattern="[0-9]{7,15}"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Gender
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Address
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={2}
            className="w-full resize-y rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        {message && <p className="text-sm text-teal-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save account"}
        </button>
      </form>
    </div>
  );
}
