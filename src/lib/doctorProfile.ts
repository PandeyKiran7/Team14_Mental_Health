import { isUnauthorizedStatus } from "@/lib/session";
import {
  fetchDoctorProfessionalDetails,
  normalizeDoctorProfessionalDetails,
} from "@/lib/doctorProfessionalApi";

export type DoctorProfileStatus = "complete" | "missing" | "unauthorized" | "error";

export async function getDoctorProfileStatus(
  token: string,
): Promise<DoctorProfileStatus> {
  const result = await fetchDoctorProfessionalDetails(token);

  if (!result.ok) {
    if (result.status && isUnauthorizedStatus(result.status)) {
      return "unauthorized";
    }
    return "error";
  }

  return result.data?.licenseNumber ? "complete" : "missing";
}

export async function doctorHasProfile(token: string): Promise<boolean> {
  const status = await getDoctorProfileStatus(token);
  return status === "complete";
}

export function getDoctorHomePath(): string {
  return "/doctor/dashboard";
}

export { normalizeDoctorProfessionalDetails };
