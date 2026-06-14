import type { AxiosResponse } from "axios";
import { apiGetCall } from "@/helper/apiService";
import { normalizeBookings, type Booking } from "@/types/booking";

type ApiResponse = AxiosResponse | { status: number; data: unknown };

const inflight = new Map<string, Promise<ApiResponse>>();

export async function fetchMyBookings(token: string): Promise<ApiResponse> {
  const existing = inflight.get(token);
  if (existing) return existing;

  const request = apiGetCall({ endpoint: "bookings", token }).finally(() => {
    inflight.delete(token);
  });

  inflight.set(token, request);
  return request;
}

export async function loadMyBookings(token: string): Promise<Booking[]> {
  const response = await fetchMyBookings(token);
  if (response.status < 200 || response.status >= 300) {
    throw new Error("Failed to load bookings");
  }
  return normalizeBookings(response.data);
}
