"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormButton from "@/components/formElements/FormButton";
import FormInput from "@/components/formElements/FormInput";
import FormPassword from "@/components/formElements/FormPassword";
import FormSelect from "@/components/formElements/FormSelect";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { apiPostCall } from "@/helper/apiService";

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

const roleOptions = [
  { value: "PATIENT", label: "Patient" },
  { value: "DOCTOR", label: "Doctor" },
];

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
    role: "PATIENT",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiPostCall({
        endpoint: "register",
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim() || form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        mobileNumber: form.mobileNumber.trim(),
        address: form.address.trim() || undefined,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        role: form.role,
      });

      if (response.status !== API_CONSTANTS.success && response.status !== 201) {
        const errData = response.data as { message?: string };
        setError(errData?.message ?? "Registration failed. Check your details.");
        return;
      }

      const body = response.data as RegisterResponse;
      if (!body.success) {
        setError(
          typeof body.message === "string"
            ? body.message
            : "Registration failed.",
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
      <h1 className="text-2xl font-bold text-teal-800">Register</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Create your account to access the diabetes management platform.
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
          hint="Must include uppercase, lowercase, number, and special character."
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

        <FormSelect
          name="role"
          label="Register as"
          value={form.role}
          onChange={(e) => updateField("role", e.target.value)}
          options={roleOptions}
          required
        />

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
