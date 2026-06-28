"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormButton from "@/components/formElements/FormButton";
import FormInput from "@/components/formElements/FormInput";
import FormPassword from "@/components/formElements/FormPassword";
import FormSelect from "@/components/formElements/FormSelect";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { apiFormPostCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";

const genderOptions = [
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "OTHER", label: "Other" },
];

const NAME_PATTERN = /^[A-Za-z\s]{2,50}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
const MOBILE_PATTERN = /^[0-9]{7,15}$/;

export default function AdminRegisterContentManagerForm() {
  const router = useRouter();
  const [account, setAccount] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    mobileNumber: "",
    address: "",
    gender: "FEMALE",
    dateOfBirth: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  function updateAccount(field: keyof typeof account, value: string) {
    setAccount((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !NAME_PATTERN.test(account.firstName.trim()) ||
      !NAME_PATTERN.test(account.lastName.trim())
    ) {
      setError("First and last name must be at least 2 letters (A–Z only).");
      return;
    }
    if (!PASSWORD_PATTERN.test(account.password)) {
      setError("Password must be 8+ chars with upper, lower, number, and @ $ ! % * ? &");
      return;
    }
    if (!MOBILE_PATTERN.test(account.mobileNumber.trim())) {
      setError("Mobile number must be 10 digits.");
      return;
    }
    if (!account.dateOfBirth) {
      setError("Date of birth is required.");
      return;
    }

    setLoading(true);
    const token = getAccessToken() ?? undefined;

    try {
      const middleName = account.middleName.trim() || account.firstName.trim();
      const formData = new FormData();
      formData.append("firstName", account.firstName.trim());
      formData.append("middleName", middleName);
      formData.append("lastName", account.lastName.trim());
      formData.append("email", account.email.trim());
      formData.append("password", account.password);
      formData.append("mobileNumber", account.mobileNumber.trim());
      formData.append("gender", account.gender);
      formData.append("dateOfBirth", account.dateOfBirth);
      // DB role enum uses INTERNAL_MANAGER (content manager accounts)
      formData.append("role", "INTERNAL_MANAGER");
      if (account.address.trim()) {
        formData.append("address", account.address.trim());
      }
      if (profileImage) {
        formData.append("userProfile", profileImage);
      }

      const response = await apiFormPostCall("register", formData, token);
      if (response.status !== 201 && response.status !== API_CONSTANTS.success) {
        setError(getApiErrorMessage(response.data, "Failed to create internal manager account."));
        return;
      }

      router.push("/admin/users?tab=managers");
    } catch {
      setError("Cannot reach backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end">
        <Link
          href="/admin/users?tab=managers"
          className="text-sm font-medium text-teal-700 underline hover:text-teal-900"
        >
          Back to internal managers
        </Link>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <section className="rounded-xl border border-teal-100 bg-white p-6">
          <h3 className="font-semibold text-teal-800">Account details</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormInput
              name="firstName"
              label="First name"
              value={account.firstName}
              onChange={(e) => updateAccount("firstName", e.target.value)}
              required
            />
            <FormInput
              name="middleName"
              label="Middle name"
              value={account.middleName}
              onChange={(e) => updateAccount("middleName", e.target.value)}
            />
            <FormInput
              name="lastName"
              label="Last name"
              value={account.lastName}
              onChange={(e) => updateAccount("lastName", e.target.value)}
              required
            />
            <FormInput
              name="email"
              type="email"
              label="Email"
              value={account.email}
              onChange={(e) => updateAccount("email", e.target.value)}
              required
            />
            <FormPassword
              name="password"
              label="Temporary password"
              value={account.password}
              onChange={(e) => updateAccount("password", e.target.value)}
              required
              hint="Share this with the internal manager for first login. Example: Test@1234"
            />
            <FormInput
              name="mobileNumber"
              label="Mobile"
              value={account.mobileNumber}
              onChange={(e) => updateAccount("mobileNumber", e.target.value)}
              required
            />
            <FormSelect
              name="gender"
              label="Gender"
              value={account.gender}
              onChange={(e) => updateAccount("gender", e.target.value)}
              options={genderOptions}
              required
            />
            <FormInput
              name="dateOfBirth"
              type="date"
              label="Date of birth"
              value={account.dateOfBirth}
              onChange={(e) => updateAccount("dateOfBirth", e.target.value)}
              required
            />
            <FormInput
              name="address"
              label="Address"
              fieldClassName="sm:col-span-2"
              value={account.address}
              onChange={(e) => updateAccount("address", e.target.value)}
            />
            {/* <div className="sm:col-span-2">
              <label htmlFor="managerProfileImage" className="mb-1 block text-sm font-medium text-zinc-700">
                Profile picture
              </label>
              <input
                id="managerProfileImage"
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-teal-800"
              />
            </div> */}
          </div>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <FormButton type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Register internal manager"}
        </FormButton>
      </form>
    </div>
  );
}
