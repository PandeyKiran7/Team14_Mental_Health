import { extractApiArray, extractApiEntity } from "@/helper/apiResponse";

export type Booking = {
  id: number;
  status: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  meetLink: string | null;
  patient: { id: number; name: string };
  doctor: { id: number; name: string; specialization: string };
};

function toBooking(raw: Record<string, unknown>): Booking | null {
  const id = typeof raw.id === "number" ? raw.id : null;
  if (id == null) return null;

  const patient = raw.patient as Record<string, unknown> | undefined;
  const doctor = raw.doctor as Record<string, unknown> | undefined;

  return {
    id,
    status: String(raw.status ?? "PENDING"),
    bookingDate: String(raw.bookingDate ?? ""),
    startTime: String(raw.startTime ?? ""),
    endTime: String(raw.endTime ?? ""),
    notes: raw.notes != null ? String(raw.notes) : null,
    meetLink: raw.meetLink != null ? String(raw.meetLink) : null,
    patient: {
      id: typeof patient?.id === "number" ? patient.id : 0,
      name: String(patient?.name ?? "Unknown patient"),
    },
    doctor: {
      id: typeof doctor?.id === "number" ? doctor.id : 0,
      name: String(doctor?.name ?? "Unknown doctor"),
      specialization: String(doctor?.specialization ?? "General"),
    },
  };
}

export function normalizeBookings(body: unknown): Booking[] {
  return extractApiArray<Record<string, unknown>>(body)
    .map(toBooking)
    .filter((booking): booking is Booking => booking !== null);
}

export function normalizeBooking(body: unknown): Booking | null {
  const entity = extractApiEntity<Record<string, unknown>>(body, "id");
  return entity ? toBooking(entity) : null;
}
