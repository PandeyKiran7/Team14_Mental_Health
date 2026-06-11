"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormButton from "@/components/formElements/FormButton";
import FormInput from "@/components/formElements/FormInput";
import FormPassword from "@/components/formElements/FormPassword";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { apiPatchCall } from "@/helper/apiService";

type ForgotPasswordResponse = {
  success: boolean;
  message?: string;
};

const PASSWORD_HINT =
  "At least 8 characters with uppercase, lowercase, number, and special character.";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiPatchCall({
        endpoint: "forgot_password",
        email: email.trim(),
        password,
      });

      if (response.status !== API_CONSTANTS.success) {
        const errData = response.data as { message?: string };
        setError(errData?.message ?? "Could not reset password. Check your details.");
        return;
      }

      const body = response.data as ForgotPasswordResponse;
      if (!body.success) {
        setError(body.message ?? "Could not reset password.");
        return;
      }

      setSuccess(body.message ?? "Password updated successfully.");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Cannot reach backend. Start it on port 4000, then restart the frontend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-teal-800">Forgot password</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Enter your account email and choose a new password.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <FormInput
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FormPassword
          name="password"
          label="New password"
          placeholder="New password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={PASSWORD_HINT}
          required
        />

        <FormPassword
          name="confirmPassword"
          label="Confirm new password"
          placeholder="Confirm new password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}

        <FormButton type="submit" disabled={loading || !!success}>
          {loading ? "Updating password…" : "Reset password"}
        </FormButton>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-teal-600 hover:underline">
          Back to login
        </Link>
      </p>
    </>
  );
}
