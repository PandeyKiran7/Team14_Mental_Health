/**
 * Backend APIs from Postman collection — Diabetes_Health_Application_Team14
 * Proxy: next.config.ts → http://localhost:4000
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const API_ENDPOINTS = {
  health: "/api/health",
  // Authentication
  login: "/api/v1/login",
  register: "/api/v1/register",
  forgot_password: "/api/v1/forget-password",
  // PatientDetailsManagement
  patient_create: "/api/v1/patient",
  patient_medical_data: "/api/v1/patient-medical-data",
  update_patient_medical_data: "/api/v1/update/patient-medical-data",
  // DoctorDetailsManagement
  doctor_data: "/api/v1/doctor-data",
  user_medical_data: "/api/v1/user-medical-data/:userId",
  // Users Management
  users: "/api/v1/users",
  user_by_id: "/api/v1/user/:userId",
  delete_user: "/api/v1/user/:userId",
  update_user: "/api/v1/update/user",
  user_status: "/api/v1/userStatus/:userId",
  patients: "/api/v1/patients",
  doctors: "/api/v1/doctors",
  content_managers: "/api/v1/content-managers",
  // BookingManagement
  book_appointment: "/api/v1/book-appointment",
  bookings: "/api/v1/bookings",
  approve_booking: "/api/v1/approve-booking/:bookingId",
  deny_booking: "/api/v1/deny-booking/:bookingId",
  // Prescription
  prescription: "/api/v1/prescription/:bookingId",
  prescription_download: "/api/v1/prescription/:bookingId/download",
  // Recommendation
  recommendation: "/api/v1/recommendation/:bookingId",
  recommendation_download: "/api/v1/recommendation/:bookingId/download",
} as const;

export function resolveApiUrl(
  endpoint: keyof typeof API_ENDPOINTS,
  pathParams?: Record<string, string | number>,
): string {
  let path: string = API_ENDPOINTS[endpoint];

  if (pathParams) {
    for (const [key, value] of Object.entries(pathParams)) {
      path = path.replace(`:${key}`, String(value));
    }
  }

  return `${API_BASE_URL}${path}`;
}

export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string =>
  resolveApiUrl(endpoint);
