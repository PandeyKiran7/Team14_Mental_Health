import { isApiSuccess, resolveApiError } from "@/helper/apiErrors";
import { apiPatchCall } from "@/helper/apiService";
import type { API_ENDPOINTS } from "@/helper/apiList";

type ReviewEndpoint = keyof Pick<
  typeof API_ENDPOINTS,
  "approve_booking" | "deny_booking"
>;

type ActionResult = { ok: true } | { ok: false; message: string };

async function reviewBooking(
  bookingId: number,
  token: string,
  endpoint: ReviewEndpoint,
  fallbackMessage: string,
): Promise<ActionResult> {
  const response = await apiPatchCall({
    endpoint,
    pathParams: { bookingId },
    token,
  });

  if (!isApiSuccess(response.status)) {
    return { ok: false, message: resolveApiError(response, fallbackMessage) };
  }

  return { ok: true };
}

export function approveBooking(bookingId: number, token: string) {
  return reviewBooking(bookingId, token, "approve_booking", "Failed to approve appointment.");
}

export function denyBooking(bookingId: number, token: string) {
  return reviewBooking(bookingId, token, "deny_booking", "Failed to deny appointment.");
}
