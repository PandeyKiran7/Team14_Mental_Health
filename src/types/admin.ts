import { extractApiArray, extractApiEntity } from "@/helper/apiResponse";

export type AdminUser = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: string;
  createdAt: string;
  mobileNumber?: string;
  gender?: string;
  address?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(u: any): AdminUser {
  return {
    userId: u.userId,
    firstName: u.firstName ?? "",
    lastName: u.lastName ?? "",
    email: u.email ?? "",
    role: u.role ?? "unknown",
    isActive: u.isActive ?? "ACTIVE",
    createdAt: u.createdAt ?? "",
    mobileNumber: u.mobileNumber,
    gender: u.gender,
    address: u.address,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeUsers(data: any): AdminUser[] {
  return extractApiArray(data).map(mapUser);
}

export function normalizeUserDetail(body: unknown): AdminUser | null {
  const entity = extractApiEntity<AdminUser>(body, "userId");
  return entity ? mapUser(entity) : null;
}

export type PatientMedicalRecord = {
  diabetesType?: string;
  diagnosisDate?: string;
  heightCM?: number;
  weightKG?: number;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  currentMedication?: string;
  targetGlucoseMin?: number;
  targetGlucoseMax?: number;
  activityLevel?: string;
  dietaryPreference?: string;
  symptoms?: string;
  shortDescription?: string;
};

export type UserWithMedicalData = AdminUser & {
  patient?: PatientMedicalRecord | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeUserWithMedicalData(body: unknown): UserWithMedicalData | null {
  const entity = extractApiEntity<UserWithMedicalData>(body, "userId");
  if (!entity) return null;
  return {
    ...mapUser(entity),
    patient: entity.patient ?? null,
  };
}
