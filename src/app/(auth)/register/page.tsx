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

type RegisterResponse = {
  success: boolean;
  message?: string | Record<string, unknown>;
  data?: string | Record<string, unknown>;
};

const genderOptions = [
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "OTHER", label: "Other" },
];

const NAME_PATTERN = /^[A-Za-z\s]{2,50}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
const MOBILE_PATTERN = /^[0-9]{7,15}$/;

function validateForm(form: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  dateOfBirth: string;
}): string | null {
  if (!NAME_PATTERN.test(form.firstName.trim())) {
    return "First name must be at least 2 letters (A–Z only).";
  }
  if (!NAME_PATTERN.test(form.lastName.trim())) {
    return "Last name must be at least 2 letters (A–Z only).";
  }
  if (!form.email.trim()) {
    return "Email is required.";
  }
  if (!PASSWORD_PATTERN.test(form.password)) {
    return "Password must be 8+ characters with upper, lower, number, and one of: @ $ ! % * ? &";
  }
  if (!MOBILE_PATTERN.test(form.mobileNumber.trim())) {
    return "Mobile number must be 7–15 digits only.";
  }
  if (!form.dateOfBirth) {
    return "Date of birth is required.";
  }
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
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

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const middleName = form.middleName.trim() || form.firstName.trim();
      const formData = new FormData();
      formData.append("firstName", form.firstName.trim());
      formData.append("middleName", middleName);
      formData.append("lastName", form.lastName.trim());
      formData.append("email", form.email.trim());
      formData.append("password", form.password);
      formData.append("mobileNumber", form.mobileNumber.trim());
      formData.append("gender", form.gender);
      formData.append("dateOfBirth", form.dateOfBirth);
      formData.append("role", "PATIENT");
      if (form.address.trim()) {
        formData.append("address", form.address.trim());
      }
      if (profileImage) {
        formData.append("userProfile", profileImage);
      }

      const response = await apiFormPostCall("register", formData);

      const ok =
        response.status === API_CONSTANTS.success || response.status === 201;

      if (!ok) {
        setError(
          getApiErrorMessage(
            response.data,
            "Registration failed. Check your details.",
          ),
        );
        return;
      }

      const body = response.data as RegisterResponse;
      if (body.success === false) {
        setError(
          getApiErrorMessage(body, "Registration failed. Check your details."),
        );
        return;
      }

      router.push("/login");
    } catch {
      setError("Cannot reach backend. Start it on port 4000, then restart the frontend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-teal-800">Patient registration</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Create a patient account to book doctors and manage your diabetes care.
        Doctor accounts are created by the admin.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            name="firstName"
            label="First name"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            required
          />
          <FormInput
            name="middleName"
            label="Middle name"
            placeholder="Middle name"
            value={form.middleName}
            onChange={(e) => updateField("middleName", e.target.value)}
          />
        </div>

        <FormInput
          name="lastName"
          label="Last name"
          placeholder="Last name"
          value={form.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          required
        />

        <FormInput
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
        />

        <FormPassword
          name="password"
          label="Password"
          placeholder="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          required
          minLength={8}
          hint="Example: Test@1234 — must include upper, lower, number, and @ $ ! % * ? &"
        />

        <FormInput
          name="mobileNumber"
          type="tel"
          label="Mobile number"
          placeholder="9800000000"
          value={form.mobileNumber}
          onChange={(e) => updateField("mobileNumber", e.target.value)}
          required
          pattern="[0-9]{7,15}"
        />

        <FormInput
          name="address"
          label="Address"
          placeholder="City, country"
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            name="gender"
            label="Gender"
            value={form.gender}
            onChange={(e) => updateField("gender", e.target.value)}
            options={genderOptions}
            required
          />

          <FormInput
            name="dateOfBirth"
            type="date"
            label="Date of birth"
            value={form.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="profileImage" className="mb-1 block text-sm font-medium text-zinc-700">
            Profile picture
          </label>
          <input
            id="profileImage"
            name="profileImage"
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-teal-800"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <FormButton type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </FormButton>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-teal-600 hover:underline">
          Already have an account?
        </Link>
      </p>
    </>
  );
}
