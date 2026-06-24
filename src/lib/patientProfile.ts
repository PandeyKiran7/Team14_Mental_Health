import { API_CONSTANTS } from "@/constants/staticConstant";
import { extractApiEntity } from "@/helper/apiResponse";
import { apiGetCall } from "@/helper/apiService";
import { isUnauthorizedStatus } from "@/lib/session";

type PatientMedicalData = {
  diabetesType: string;
};

export type PatientProfileStatus = "complete" | "missing" | "unauthorized" | "error";

export async function getPatientProfileStatus(
  token: string,
): Promise<PatientProfileStatus> {
  try {
    const response = await apiGetCall({
      endpoint: "patient_medical_data",
      token,
    });

    if (response.status === API_CONSTANTS.success) {
      const patient = extractApiEntity<PatientMedicalData>(
        response.data,
        "diabetesType",
      );
      return patient ? "complete" : "missing";
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

export async function patientHasProfile(token: string): Promise<boolean> {
  const status = await getPatientProfileStatus(token);
  return status === "complete";
}

export function getPatientHomePath(): string {
  return "/patient/dashboard";
}
