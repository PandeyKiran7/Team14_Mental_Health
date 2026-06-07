"use client";

import Link from "next/link";
import FormButton from "@/components/formElements/FormButton";
import FormInput from "@/components/formElements/FormInput";

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-teal-800">Forgot password</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Enter your email and we will help you reset your password.
      </p>

      <form className="mt-6 space-y-4">
        <FormInput
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <FormButton type="button" disabled>
          Send reset link (coming soon)
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
