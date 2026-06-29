import { resolveApiUrl } from "@/helper/apiList";
import { loadBookableDoctors } from "@/lib/bookableDoctors";
import {
  fetchDoctorFinanceDetails,
  payDoctorSalary,
} from "@/lib/doctorFinanceApi";
import { getAccessToken } from "@/lib/auth";
import {
  getAllDoctors,
  getAllUsers,
  getDoctorUsersFromAllUsers,
} from "@/lib/userApi";

export type Team14DevConsoleApi = {
  getToken: () => string | null;
  urls: {
    doctors: string;
    users: string;
    doctorFinance: (userId: number) => string;
    payout: (userId: number) => string;
    bookAppointment: (userId: number) => string;
  };
  getAllDoctors: () => Promise<unknown>;
  getAllUsers: () => Promise<unknown>;
  getDoctorUsersFromAllUsers: () => Promise<unknown>;
  getBookableDoctors: () => Promise<unknown>;
  getDoctorFinance: (userId: number) => Promise<unknown>;
  paySalary: (userId: number) => Promise<unknown>;
};

function log(label: string, result: unknown) {
  console.group(`[Team14 API] ${label}`);
  console.groupEnd();
  return result;
}

export function createDevConsoleApi(): Team14DevConsoleApi {
  return {
    getToken() {
      const token = getAccessToken();
      return token;
    },
    urls: {
      doctors: resolveApiUrl("doctors"),
      users: resolveApiUrl("users"),
      doctorFinance: (userId) => resolveApiUrl("doctor_finance_details", { doctorId: userId }),
      payout: (userId) => resolveApiUrl("pay_salary", { userId }),
      bookAppointment: (userId) =>
        resolveApiUrl("book_appointment", { doctorId: userId }),
    },
    async getAllDoctors() {
      const result = await getAllDoctors();
      return log("GET /api/v1/doctors", result);
    },
    async getAllUsers() {
      const result = await getAllUsers();
      return log("GET /api/v1/users", result);
    },
    async getDoctorUsersFromAllUsers() {
      const result = await getDoctorUsersFromAllUsers();
      return log("GET /api/v1/users (DOCTOR only)", result);
    },
    async getBookableDoctors() {
      const token = getAccessToken();
      if (!token) {
        return log("Bookable doctors", { ok: false, message: "Not logged in." });
      }
      const result = await loadBookableDoctors(token);
      return log("Patient bookable doctors", result);
    },
    async getDoctorFinance(userId: number) {
      const result = await fetchDoctorFinanceDetails(userId);
      return log(`POST /api/v1/doctor-finance-details/${userId}`, result);
    },
    async paySalary(userId: number) {
      const result = await payDoctorSalary(userId);
      return log(`POST /api/v1/payout/${userId}`, result);
    },
  };
}

declare global {
  interface Window {
    team14Api?: Team14DevConsoleApi;
  }
}

export function registerDevConsoleApi() {
  if (process.env.NODE_ENV !== "development") return;

  const api = createDevConsoleApi();
  window.team14Api = api;

  const token = getAccessToken();

}
