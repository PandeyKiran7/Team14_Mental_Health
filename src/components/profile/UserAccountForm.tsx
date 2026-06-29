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
import {
  normalizeUserDetail,
  normalizeUserWithMedicalData,
} from "@/types/admin";
import ApiMessage from "@/components/ui/ApiMessage";
import ProfileAccountHeader from "@/components/profile/ProfileAccountHeader";
import ProfileDetailGrid from "@/components/profile/ProfileDetailGrid";
import ProfileEditButton from "@/components/profile/ProfileEditButton";
import ProfileSection from "@/components/profile/ProfileSection";
import { resolveProfileImageUrl, uploadProfileImage } from "@/lib/profileImageApi";

function getInitials(user: StoredUser): string {
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || user.email?.[0]?.toUpperCase() || "U";
}

// ─── Props ──────────────────────────────────────────────────────────────
type UserAccountFormProps = {
  initialUser?: StoredUser; // optional – when viewing another user's profile
  hideHeader?: boolean;
};

// ─── Types & Helpers ────────────────────────────────────────────────────
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

const NAME_PATTERN = /^[A-Za-z\s]{2,50}$/;

function validateAccountForm(form: AccountFormState): string | null {
  if (!form.firstName.trim() || !form.lastName.trim()) {
    return "First name and last name are required.";
  }

  if (!NAME_PATTERN.test(form.firstName.trim())) {
    return "First name can only contain letters and must be 2–50 characters.";
  }

  if (!NAME_PATTERN.test(form.lastName.trim())) {
    return "Last name can only contain letters and must be 2–50 characters.";
  }

  if (!/^[0-9]{7,15}$/.test(form.mobileNumber.trim())) {
    return "Mobile number must be 7–15 digits.";
  }

  return null;
}

function formatGender(value: string): string {
  return GENDER_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

type AccountDetail = {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  address?: string;
  gender?: string;
  isActive?: string;
  profileImageURL?: string;
};

function accountDetailFromResponse(
  body: unknown,
  role?: string,
): AccountDetail | null {
  if (role?.toUpperCase() === "PATIENT") {
    const detail = normalizeUserWithMedicalData(body);
    if (!detail) return null;
    return {
      firstName: detail.firstName,
      lastName: detail.lastName,
      mobileNumber: detail.mobileNumber,
      address: detail.address,
      gender: detail.gender,
      isActive: detail.isActive,
      profileImageURL: detail.profileImageURL,
    };
  }

  const detail = normalizeUserDetail(body);
  return detail;
}

async function fetchAccountDetail(
  userId: number,
  role: string | undefined,
  token: string,
) {
  if (isAdminRole(role)) {
    return apiGetCall({
      endpoint: "user_by_id",
      pathParams: { userId },
      token,
    });
  }

  if (role?.toUpperCase() === "PATIENT") {
    return apiGetCall({
      endpoint: "user_medical_data",
      pathParams: { userId },
      token,
    });
  }

  if (role?.toUpperCase() === "DOCTOR") {
    return apiGetCall({
      endpoint: "view_profile",
      pathParams: { userId },
      token,
    });
  }

  return null;
}

// ─── Component ──────────────────────────────────────────────────────────
export default function UserAccountForm({ initialUser, hideHeader = false }: UserAccountFormProps) {
  const [user, setUser] = useState<StoredUser | null>(initialUser || null);
  const [form, setForm] = useState<AccountFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // ── Determine if we are viewing our own profile ──
  const loggedInUser = getStoredUser();
  const isOwnProfile = user?.userId === loggedInUser?.userId;

  useEffect(() => {
    async function loadAccount() {
      setLoading(true);
      setError(null);

      // 1) If an initialUser was provided (e.g., from a doctor profile view),
      //    use it directly and skip API fetch.
      if (initialUser) {
        setUser(initialUser);
        setForm(mapStoredToForm(initialUser));
        setLoading(false);
        return;
      }

      // 2) Otherwise, load the logged‑in user from localStorage / API.
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

        const response = await fetchAccountDetail(
          stored.userId,
          stored.role,
          token,
        );

        if (response && isApiSuccess(response.status)) {
          const detail = accountDetailFromResponse(response.data, stored.role);
          if (detail) {
            setForm({
              firstName: detail.firstName ?? "",
              lastName: detail.lastName ?? "",
              mobileNumber: detail.mobileNumber ?? "",
              address: detail.address ?? "",
              gender: detail.gender ?? "MALE",
            });
            const updatedUser: StoredUser = {
              ...stored,
              firstName: detail.firstName,
              lastName: detail.lastName,
              mobileNumber: detail.mobileNumber,
              address: detail.address,
              gender: detail.gender,
              isActive: detail.isActive,
              profileImageURL: detail.profileImageURL,
            };
            setUser(updatedUser);
            setStoredUser(updatedUser);
            setLoading(false);
            return;
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
  }, [initialUser]);

  // ── Render helpers ────────────────────────────────────────────────────
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

  async function refreshProfileImage(profileImageURL?: string) {
    const stored = getStoredUser();
    const token = getAccessToken();

    if (stored?.userId && token) {
      const response = await fetchAccountDetail(
        stored.userId,
        stored.role,
        token,
      );

      if (response && isApiSuccess(response.status)) {
        const detail = accountDetailFromResponse(response.data, stored.role);
        if (detail) {
          const updatedUser: StoredUser = {
            ...stored,
            profileImageURL: detail.profileImageURL ?? profileImageURL,
          };
          setUser((prev) => (prev ? { ...prev, profileImageURL: updatedUser.profileImageURL } : prev));
          setStoredUser(updatedUser);
          return;
        }
      }
    }

    if (profileImageURL !== undefined && user) {
      const updatedUser = { ...user, profileImageURL };
      setUser(updatedUser);
      if (stored) setStoredUser({ ...stored, profileImageURL });
    }
  }

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
    setSelectedFile(null);
    setPreviewUrl(null);
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

    const validationError = validateAccountForm(form);
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    const token = getAccessToken();
    if (!token || !user?.userId) {
      setError("Please log in again.");
      setSaving(false);
      return;
    }

    let newProfileImageURL = user.profileImageURL;

    try {
      // 1) If an image file was selected, upload it first!
      if (selectedFile) {
        const uploadResult = await uploadProfileImage(selectedFile, token);
        if (!uploadResult.ok) {
          setError(uploadResult.message || "Failed to upload profile image.");
          setSaving(false);
          return;
        }
        newProfileImageURL = uploadResult.profileImageURL ?? undefined;
      }

      // 2) Save user text details
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        address: form.address.trim() || undefined,
        gender: form.gender,
      };

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
        profileImageURL: newProfileImageURL,
      };

      setStoredUser(updatedUser);
      setUser(updatedUser);
      setMessage("Account updated successfully.");
      setEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (submitError) {
      setError(getNetworkErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  // Determine if the Edit button should be shown:
  // Only for own profile (isOwnProfile) and not already editing, and not admin.
  const showEditButton = !loading && !editing && isOwnProfile && !isAdmin;

  return (
    <ProfileSection
      title="Account details"
      description={
        editing
          ? "Update your personal information below."
          : isOwnProfile
          ? "Your account information at a glance."
          : "Doctor's account information (read‑only)."
      }
      action={showEditButton ? <ProfileEditButton onClick={() => setEditing(true)} /> : null}
    >
      {!hideHeader && (
        <ProfileAccountHeader
          user={user}
          className="mb-6"
          allowImageUpload={isOwnProfile && !isAdmin}
          onProfileImageUpdated={(url) => void refreshProfileImage(url)}
        />
      )}

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
          {/* Profile Image Field inside Edit Form */}
          <div className="flex items-center gap-6 border-b border-zinc-100 pb-4 mb-4">
            <div className="relative shrink-0">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-teal-500"
                />
              ) : user.profileImageURL ? (
                <img
                  src={resolveProfileImageUrl(user.profileImageURL) || ""}
                  alt="Current"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-lg font-semibold text-teal-700">
                  {getInitials(user)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <FormField label="Profile picture" htmlFor="profileImage">
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
              </FormField>
            </div>
          </div>

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