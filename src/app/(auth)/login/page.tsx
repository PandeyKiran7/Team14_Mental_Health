"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormButton from "@/components/formElements/FormButton";
import FormInput from "@/components/formElements/FormInput";
import FormPassword from "@/components/formElements/FormPassword";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { apiPostCall } from "@/helper/apiService";
import { setAccessToken, setStoredUser } from "@/lib/auth";
import { doctorHasProfile, getDoctorHomePath } from "@/lib/doctorProfile";
import { getPatientHomePath, patientHasProfile } from "@/lib/patientProfile";

type LoginUser = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password?: string;
};

type LoginResponse = {
  success: boolean;
  data?: {
    accessToken: string;
    user: LoginUser;
  };
  message?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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


      console.log("Login response:", response);

      if (response.status !== API_CONSTANTS.success) {
        const errData = response.data as { message?: string };
        setError(errData?.message ?? "Login failed. Check your credentials.");
        return;
      }

      const body = response.data as LoginResponse;
      if (!body.success || !body.data?.accessToken) {
        setError(body.message ?? "Login failed.");
        return;
      }

      setAccessToken(body.data.accessToken);
      const { password: _, ...safeUser } = body.data.user;
      setStoredUser(safeUser);

      const role = body.data.user.role?.toLowerCase();
      if (role === "patient") {
        const hasProfile = await patientHasProfile(body.data.accessToken);
        router.push(getPatientHomePath(hasProfile));
      } else if (role === "doctor") {
        const hasProfile = await doctorHasProfile(body.data.accessToken);
        router.push(getDoctorHomePath(hasProfile));
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch {
      setError("Cannot reach backend. Start it on port 4000, then restart the frontend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-teal-800">Login</h1>

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
