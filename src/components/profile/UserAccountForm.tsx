"use client";

import { useEffect, useState } from "react";
import FormButton from "@/components/formElements/FormButton";
import FormInput from "@/components/formElements/FormInput";
import FormSelect from "@/components/formElements/FormSelect";
import FormField from "@/components/formElements/FormField";
import {
  getNetworkErrorMessage,
  isApiSuccess,
  resolveApiError,
} from "@/helper/apiErrors";
import { apiGetCall, apiPatchCall } from "@/helper/apiService";
import {
  getAccessToken,
  getStoredUser,
  setStoredUser,
  type StoredUser,
} from "@/lib/auth";
import { isAdminRole } from "@/lib/userRoles";
import { normalizeUserDetail } from "@/types/admin";
import ApiMessage from "@/components/ui/ApiMessage";
import ProfileAccountHeader from "@/components/profile/ProfileAccountHeader";
import ProfileDetailGrid from "@/components/profile/ProfileDetailGrid";
import ProfileEditButton from "@/components/profile/ProfileEditButton";
import ProfileSection from "@/components/profile/ProfileSection";

type AccountFormState = {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  address: string;
  gender: string;
};

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const emptyForm: AccountFormState = {
  firstName: "",
  lastName: "",
  mobileNumber: "",
  address: "",
  gender: "MALE",
};

function mapStoredToForm(user: StoredUser): AccountFormState {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    mobileNumber: user.mobileNumber ?? "",
    address: user.address ?? "",
    gender: user.gender ?? "MALE",
  };
}

function formatGender(value: string): string {
  return GENDER_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export default function UserAccountForm() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [form, setForm] = useState<AccountFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccount() {
      setLoading(true);
      setError(null);

      const stored = getStoredUser();
      if (!stored?.userId) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(stored);

      try {
        const token = getAccessToken();
        if (!token) {
          setForm(mapStoredToForm(stored));
          setLoading(false);
          return;
        }

        if (isAdminRole(stored.role)) {
          const response = await apiGetCall({
            endpoint: "user_by_id",
            pathParams: { userId: stored.userId },
            token,
          });

          if (isApiSuccess(response.status)) {
            const detail = normalizeUserDetail(response.data);
            if (detail) {
              setForm({
                firstName: detail.firstName ?? "",
                lastName: detail.lastName ?? "",
                mobileNumber: detail.mobileNumber ?? "",
                address: detail.address ?? "",
                gender: detail.gender ?? "MALE",
              });
              setUser({
                ...stored,
                firstName: detail.firstName,
                lastName: detail.lastName,
                mobileNumber: detail.mobileNumber,
                address: detail.address,
                gender: detail.gender,
                isActive: detail.isActive,
              });
              setLoading(false);
              return;
            }
          }
        }

        setForm(mapStoredToForm(stored));
      } catch (loadError) {
        setError(getNetworkErrorMessage(loadError));
        setForm(mapStoredToForm(stored));
      } finally {
        setLoading(false);
      }
    }

    void loadAccount();
  }, []);

  if (!user) {
    return (
      <ProfileSection title="Account details">
        <p className="text-sm text-zinc-500">
          No account information found. Please log in again.
        </p>
      </ProfileSection>
    );
  }

  const isAdmin = isAdminRole(user.role);

  function updateField(field: keyof AccountFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCancelEdit() {
    if (user) {
      setForm(mapStoredToForm(user));
    }
    setEditing(false);
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      setSaving(false);
      return;
    }

    if (!/^[0-9]{7,15}$/.test(form.mobileNumber.trim())) {
      setError("Mobile number must be 10 digits.");
      setSaving(false);
      return;
    }

    const token = getAccessToken();
    if (!token || !user?.userId) {
      setError("Please log in again.");
      setSaving(false);
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      mobileNumber: form.mobileNumber.trim(),
      address: form.address.trim() || undefined,
      gender: form.gender,
    };

    try {
      const response = await apiPatchCall({
        endpoint: "update_user",
        ...payload,
        token,
      });

      if (!isApiSuccess(response.status)) {
        setError(resolveApiError(response, "Failed to update account."));
        return;
      }

      const updatedUser: StoredUser = {
        ...user,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        address: form.address.trim(),
        gender: form.gender,
      };

      setStoredUser(updatedUser);
      setUser(updatedUser);
      setMessage("Account updated successfully.");
      setEditing(false);
    } catch (submitError) {
      setError(getNetworkErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProfileSection
      title="Account details"
      description={
        editing
          ? "Update your personal information below."
          : "Your account information at a glance."
      }
      action={
        !loading && !editing && !isAdmin ? (
          <ProfileEditButton onClick={() => setEditing(true)} />
        ) : null
      }
    >
      <ProfileAccountHeader user={user} className="mb-6" />

      {/* {isAdmin && !editing && (
        <ApiMessage
          variant="info"
          className="mb-4"
          message="Admin account details are view-only here. Use the Users page to manage other accounts."
        />
      )} */}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading account details…</p>
      ) : !editing ? (
        <div className="space-y-4">
          <ProfileDetailGrid
            items={[
              { label: "First name", value: form.firstName },
              { label: "Last name", value: form.lastName },
              { label: "Email", value: user.email },
              { label: "Mobile number", value: form.mobileNumber },
              { label: "Gender", value: formatGender(form.gender) },
              { label: "Role", value: user.role },
              { label: "Address", value: form.address },
            ]}
          />
          {message && <ApiMessage message={message} variant="success" />}
          {error && <ApiMessage message={error} variant="error" />}
        </div>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              name="firstName"
              label="First name"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              required
            />
            <FormInput
              name="lastName"
              label="Last name"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              name="email"
              type="email"
              label="Email"
              value={user.email ?? ""}
              disabled
              hint="Email cannot be changed here."
            />
            <FormInput
              name="mobileNumber"
              type="tel"
              label="Mobile number"
              value={form.mobileNumber}
              onChange={(e) => updateField("mobileNumber", e.target.value)}
              required
              pattern="[0-9]{7,15}"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormSelect
              name="gender"
              label="Gender"
              value={form.gender}
              onChange={(e) => updateField("gender", e.target.value)}
              options={GENDER_OPTIONS}
              required
            />
            <FormInput
              name="role"
              label="Role"
              value={user.role ?? ""}
              disabled
            />
          </div>

          <FormField label="Address" htmlFor="address">
            <textarea
              id="address"
              name="address"
              rows={3}
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </FormField>

          {message && <ApiMessage message={message} variant="success" />}
          {error && <ApiMessage message={error} variant="error" />}

          <div className="flex flex-wrap gap-3">
            <FormButton type="submit" disabled={saving} fullWidth={false}>
              {saving ? "Saving…" : "Save changes"}
            </FormButton>
            <FormButton
              type="button"
              variant="secondary"
              fullWidth={false}
              disabled={saving}
              onClick={handleCancelEdit}
            >
              Cancel
            </FormButton>
          </div>
        </form>
      )}
    </ProfileSection>
  );
}
