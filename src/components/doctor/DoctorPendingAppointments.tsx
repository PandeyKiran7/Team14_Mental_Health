"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  getNetworkErrorMessage,
  isApiSuccess,
  resolveApiError,
} from "@/helper/apiErrors";
import BookingReviewDialogs from "@/components/booking/BookingReviewDialogs";
import { useBookingReview } from "@/hooks/useBookingReview";
import { getAccessToken } from "@/lib/auth";
import { fetchMyBookings } from "@/lib/myBookings";
import { handleSessionExpired, isUnauthorizedStatus } from "@/lib/session";
import { normalizeBookings, type Booking } from "@/types/booking";
import ApiMessage from "@/components/ui/ApiMessage";

export default function DoctorPendingAppointments() {
  const [pending, setPending] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = getAccessToken();
    if (!token) {
      setError("Please log in to view appointments.");
      setPending([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetchMyBookings(token);

      if (!isApiSuccess(response.status)) {
        if (isUnauthorizedStatus(response.status)) {
          handleSessionExpired();
          return;
        }
        setError(resolveApiError(response, "Failed to load appointments."));
        setPending([]);
        return;
      }

      const all = normalizeBookings(response.data);
      setPending(all.filter((booking) => booking.status === "PENDING"));
    } catch (loadError) {
      setError(getNetworkErrorMessage(loadError));
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const review = useBookingReview(load);

  return (
    <div className="rounded-xl border border-teal-100 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-teal-800">Pending appointments</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Approve or deny patient requests. Status updates on the patient side.
          </p>
        </div>
        <Link
          href="/doctor/bookings"
          className="text-sm font-medium text-teal-700 underline hover:text-teal-900"
        >
          View all appointments
        </Link>
      </div>

      {loading && <p className="mt-4 text-sm text-zinc-500">Loading…</p>}
      {error && <ApiMessage message={error} variant="error" className="mt-4" />}

      {!loading && !error && pending.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">No pending appointment requests.</p>
      )}

      <div className="mt-4 space-y-3">
        {pending.map((booking) => (
          <div
            key={booking.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50/50 px-4 py-3"
          >
            <div>
              <p className="font-medium text-zinc-800">{booking.patient.name}</p>
              <p className="text-sm text-zinc-600">
                {booking.bookingDate} · {booking.startTime}–{booking.endTime}
              </p>
              {booking.notes && (
                <p className="mt-1 text-xs text-zinc-500">{booking.notes}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={review.actionId === booking.id}
                onClick={() => review.requestApprove(booking.id)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={review.actionId === booking.id}
                onClick={() => review.requestDeny(booking.id)}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>

      <BookingReviewDialogs
        {...review}
        getTarget={(bookingId) => pending.find((booking) => booking.id === bookingId)}
        onConfirmApprove={() => void review.confirmApprove()}
        onConfirmDeny={() => void review.confirmDeny()}
        onCancelApprove={review.cancelApprove}
        onCancelDeny={review.cancelDeny}
      />
    </div>
  );
}
