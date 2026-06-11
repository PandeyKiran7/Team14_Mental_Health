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

export function normalizeBookings(body: unknown): Booking[] {
  return extractApiArray<Booking>(body);
}

export function normalizeBooking(body: unknown): Booking | null {
  return extractApiEntity<Booking>(body, "id");
}
