import { API_CONSTANTS } from "@/constants/staticConstant";
import { apiGetCall } from "@/helper/apiService";

export async function doctorHasProfile(token: string): Promise<boolean> {
  const response = await apiGetCall({
    endpoint: "doctor_data",
    token,
  });

  return response.status === API_CONSTANTS.success;
}

export function getDoctorHomePath(hasProfile: boolean): string {
  return hasProfile ? "/doctor/dashboard" : "/doctor/profile";
}
