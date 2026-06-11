import { API_CONSTANTS } from "@/constants/staticConstant";
import { extractApiEntity } from "@/helper/apiResponse";
import { apiGetCall } from "@/helper/apiService";

type PatientMedicalData = {
  diabetesType: string;
};

export async function patientHasProfile(token: string): Promise<boolean> {
  const response = await apiGetCall({
    endpoint: "patient_medical_data",
    token,
  });

  if (response.status !== API_CONSTANTS.success) {
    return false;
  }

  return (
    extractApiEntity<PatientMedicalData>(response.data, "diabetesType") !== null
  );
}

export function getPatientHomePath(hasProfile: boolean): string {
  return hasProfile ? "/patient/dashboard" : "/patient/profile";
}
