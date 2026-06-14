export type DoctorProfessionalData = {
  licenseNumber: string;
  qualification: string;
  specialization: string;
  yearsOfExperience: number;
  biography: string;
  consultationFee: number;
  availableFrom: string;
  availableTo: string;
  availableDays: string[];
};

export const weekDays = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

export const emptyDoctorProfessionalForm = {
  licenseNumber: "",
  qualification: "",
  specialization: "",
  yearsOfExperience: "",
  biography: "",
  consultationFee: "",
  availableFrom: "09:00",
  availableTo: "17:00",
  availableDays: [] as string[],
};

export function doctorDataToForm(data: DoctorProfessionalData) {
  return {
    licenseNumber: data.licenseNumber ?? "",
    qualification: data.qualification ?? "",
    specialization: data.specialization ?? "",
    yearsOfExperience: String(data.yearsOfExperience ?? ""),
    biography: data.biography ?? "",
    consultationFee: String(data.consultationFee ?? ""),
    availableFrom: data.availableFrom ?? "09:00",
    availableTo: data.availableTo ?? "17:00",
    availableDays: data.availableDays ?? [],
  };
}

export function formToDoctorPayload(form: typeof emptyDoctorProfessionalForm) {
  return {
    licenseNumber: form.licenseNumber.trim(),
    qualification: form.qualification.trim(),
    specialization: form.specialization.trim(),
    yearsOfExperience: Number(form.yearsOfExperience),
    biography: form.biography.trim(),
    consultationFee: Number(form.consultationFee),
    availableFrom: form.availableFrom.slice(0, 5),
    availableTo: form.availableTo.slice(0, 5),
    availableDays: form.availableDays,
  };
}
