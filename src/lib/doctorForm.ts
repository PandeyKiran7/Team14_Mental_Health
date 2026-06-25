import type {
  AddDoctorProfessionalProfilePayload,
  DoctorProfessionalDetails,
  WeekDay,
} from "@/types/doctorProfessional";

export type { AddDoctorProfessionalProfilePayload, DoctorProfessionalDetails, WeekDay };

export const weekDays: WeekDay[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export const emptyDoctorProfessionalForm = {
  licenseNumber: "",
  qualification: "",
  specialization: "",
  yearsOfExperience: "",
  biography: "",
  consultationFee: "",
  availableFrom: "09:00",
  availableTo: "17:00",
  availableDays: [] as WeekDay[],
};

export type DoctorProfessionalFormValues = typeof emptyDoctorProfessionalForm;

export function doctorDataToForm(data: DoctorProfessionalDetails) {
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

export function formToDoctorPayload(
  form: DoctorProfessionalFormValues,
): AddDoctorProfessionalProfilePayload {
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

export function formatWeekDay(day: string): string {
  return day.charAt(0) + day.slice(1).toLowerCase();
}
