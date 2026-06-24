export type WeekDay =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

/** POST/PATCH /api/v1/doctor-data */
export type AddDoctorProfessionalProfilePayload = {
  licenseNumber: string;
  qualification: string;
  specialization: string;
  yearsOfExperience: number;
  biography: string;
  consultationFee: number;
  availableFrom: string;
  availableTo: string;
  availableDays: WeekDay[];
  averageRating?: number;
};

export type DoctorProfessionalDetails = AddDoctorProfessionalProfilePayload;
