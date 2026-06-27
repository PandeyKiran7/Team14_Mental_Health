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
      // No profile image appended

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Registration</h1>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Section heading */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Personal Information
          </h2>
        </div>

        {/* First, Middle, Last - 3 columns on desktop */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormInput
            name="firstName"
            label="First name *"
            placeholder="John"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            required
          />
          <FormInput
            name="middleName"
            label="Middle name"
            placeholder="Michael"
            value={form.middleName}
            onChange={(e) => updateField("middleName", e.target.value)}
          />
          <FormInput
            name="lastName"
            label="Last name *"
            placeholder="Doe"
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            required
          />
        </div>

        {/* Email & Password - 2 columns */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            name="email"
            type="email"
            label="Email *"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
          />
          <FormPassword
            name="password"
            label="Password *"
            placeholder="Create a strong password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
            minLength={8}
          />
        </div>

        {/* Mobile & Address - 2 columns */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            name="mobileNumber"
            type="tel"
            label="Mobile number *"
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
        </div>

        {/* Gender & Date of Birth - 2 columns */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelect
            name="gender"
            label="Gender *"
            value={form.gender}
            onChange={(e) => updateField("gender", e.target.value)}
            options={genderOptions}
            required
          />
          <FormInput
            name="dateOfBirth"
            type="date"
            label="Date of birth *"
            value={form.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
            required
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <FormButton
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-150 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating account…
            </span>
          ) : (
            "Register"
          )}
        </FormButton>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
          Sign in
        </Link>
      </p>
    </>
  );
}