/**
 * Frontend-only connection to backend (no backend changes).
 * Uses Next.js rewrites in next.config.ts — requests go to same origin,
 * Next.js proxies to http://localhost:4000.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const API_ENDPOINTS = {
  health: "/api/health",
  login: "/api/v1/login",
  register: "/api/v1/register",
  forgot_password: "/api/v1/forget-password",
  refresh_token: "/api/v1/auth/refresh",
  newsletter: "/api/v1/newsletter",
  otp_send: "/api/v1/otp/send",
  otp_verify: "/api/v1/otp/verify",
  patient_medical_data: "/api/v1/patient-medical-data",
  update_patient_medical_data: "/api/v1/update/patient-medical-data",
  doctor_data: "/api/v1/doctor-data",
  users: "/api/v1/users",
} as const;

export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
  return `${API_BASE_URL}${API_ENDPOINTS[endpoint]}`;
};
