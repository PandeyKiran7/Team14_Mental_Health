import type { AxiosResponse } from "axios";
import { isApiSuccess, resolveApiError } from "@/helper/apiErrors";
import { apiGetCall } from "@/helper/apiService";
import { normalizeBookings, type Booking } from "@/types/booking";

type ApiResponse = AxiosResponse | { status: number; data: unknown };

type BookingsResult =
  | { ok: true; data: Booking[] }
  | { ok: false; message: string; status?: number };

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

export async function loadMyBookingsSafe(token: string): Promise<BookingsResult> {
  try {
    const response = await fetchMyBookings(token);

    if (!isApiSuccess(response.status)) {
      return {
        ok: false,
        message: resolveApiError(response, "Failed to load bookings."),
        status: response.status,
      };
    }

    return { ok: true, data: normalizeBookings(response.data) };
  } catch {
    return { ok: false, message: "Cannot reach the server. Check that the backend is running." };
  }
}

/** @deprecated Prefer loadMyBookingsSafe — throws on failure */
export async function loadMyBookings(token: string): Promise<Booking[]> {
  const result = await loadMyBookingsSafe(token);
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.data;
}
