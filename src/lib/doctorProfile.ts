import { API_CONSTANTS } from "@/constants/staticConstant";
import { apiGetCall } from "@/helper/apiService";
import { isUnauthorizedStatus } from "@/lib/session";

export type DoctorProfileStatus = "complete" | "missing" | "unauthorized" | "error";

export async function getDoctorProfileStatus(
  token: string,
): Promise<DoctorProfileStatus> {
  try {
    const response = await apiGetCall({
      endpoint: "doctor_data",
      token,
    });

    if (response.status === API_CONSTANTS.success) {
      return "complete";
    }

    if (response.status === 404) {
      return "missing";
    }

    if (isUnauthorizedStatus(response.status)) {
      return "unauthorized";
    }

    return "error";
  } catch {
    return "error";
  }
}

export async function doctorHasProfile(token: string): Promise<boolean> {
  const status = await getDoctorProfileStatus(token);
  return status === "complete";
}

export function getDoctorHomePath(hasProfile: boolean): string {
  return hasProfile ? "/doctor/dashboard" : "/doctor/profile";
}
