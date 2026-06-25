"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormButton from "@/components/formElements/FormButton";
import FormInput from "@/components/formElements/FormInput";
import FormPassword from "@/components/formElements/FormPassword";
import {
  getApiErrorMessage,
  getNetworkErrorMessage,
  isApiSuccess,
  resolveApiError,
} from "@/helper/apiErrors";
import { apiPostCall } from "@/helper/apiService";
import { extractApiEntity } from "@/helper/apiResponse";
import { setAccessToken, setStoredUser } from "@/lib/auth";
import { getDoctorHomePath } from "@/lib/doctorProfile";
import { getPatientHomePath } from "@/lib/patientProfile";

type LoginUser = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  mobileNumber?: string;
  address?: string;
  gender?: string;
  password?: string;
};

type LoginPayload = {
  accessToken: string;
  user: LoginUser;
};

export default function LoginPage() {
  const router = useRouter();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSessionExpired(new URLSearchParams(window.location.search).get("expired") === "1");
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiPostCall({
        endpoint: "login",
        email,
        password,
      });

      if (!isApiSuccess(response.status)) {
        setError(resolveApiError(response, "Login failed. Check your credentials."));
        return;
      }

      const payload = extractApiEntity<LoginPayload>(response.data, "accessToken");
      if (!payload?.accessToken || !payload.user) {
        setError(getApiErrorMessage(response.data, "Login failed. Invalid server response."));
        return;
      }

      setAccessToken(payload.accessToken);
      const { password: _, ...safeUser } = payload.user;
      setStoredUser({
        userId: safeUser.userId,
        firstName: safeUser.firstName,
        lastName: safeUser.lastName,
        email: safeUser.email,
        role: safeUser.role,
        mobileNumber: safeUser.mobileNumber,
        address: safeUser.address,
        gender: safeUser.gender,
      });

      const role = payload.user.role?.toLowerCase();
      if (role === "patient") {
        router.push(getPatientHomePath());
      } else if (role === "doctor") {
        router.push(getDoctorHomePath());
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "internal_manager") {
        router.push("/content-manager/blogs");
      } else {
        router.push("/");
      }
    } catch (error) {
      setError(getNetworkErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-teal-800">Login</h1>

      {sessionExpired && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your session expired after 1 hour. Please log in again to continue.
        </p>
      )}

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
          label="Password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <FormButton type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </FormButton>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-teal-600 hover:underline">
          Forgot password?
        </Link>
        {" · "}
        <Link href="/register" className="text-teal-600 hover:underline">
          Register
        </Link>
      </p>
    </>
  );
}
