/** Backend lives in a separate repo — paths must match teammate's API */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const API_ENDPOINTS = {
  health: "/api/health",
  login: "/api/auth/login",
  register: "/api/auth/register",
  mood_list: "/api/mood",
  mood_save: "/api/mood",
  appointments: "/api/appointments",
} as const;

export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
  return `${API_BASE_URL}${API_ENDPOINTS[endpoint]}`;
};
