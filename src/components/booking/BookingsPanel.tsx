"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  getNetworkErrorMessage,
  isApiSuccess,
  resolveApiError,
} from "@/helper/apiErrors";
import BookingReviewDialogs from "@/components/booking/BookingReviewDialogs";
import { useBookingReview } from "@/hooks/useBookingReview";
import { getAccessToken, getStoredUser } from "@/lib/auth";
import { fetchMyBookings } from "@/lib/myBookings";
import { handleSessionExpired, isUnauthorizedStatus } from "@/lib/session";
import { cn } from "@/lib/utils";
import { normalizeBookings, type Booking } from "@/types/booking";
import BookAppointmentForm from "@/components/booking/BookAppointmentForm";
import ApiMessage from "@/components/ui/ApiMessage";

const PrescriptionSection = dynamic(
  () => import("@/components/prescription/PrescriptionSection"),
  { ssr: false },
);

const RecommendationSection = dynamic(
  () => import("@/components/recommendation/RecommendationSection"),
  { ssr: false },
);

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-sky-100 text-sky-800",
};

function bookingsLoadError(response: { status: number; data: unknown }): string {
  if (response.status >= 500) {
    return "Could not load bookings. Check that the backend is running on port 4000 and your doctor profile is complete.";
  }
  return resolveApiError(response, "Failed to load bookings.");
}

type BookingsPanelProps = {
  showBookForm?: boolean;
};

export default function BookingsPanel({ showBookForm = false }: BookingsPanelProps) {
  const [role, setRole] = useState<"DOCTOR" | "PATIENT">("PATIENT");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = getStoredUser()?.role?.toUpperCase();
    if (storedRole === "DOCTOR" || storedRole === "PATIENT") {
      setRole(storedRole);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = getAccessToken();
    if (!token) {
      setError("Please log in to view bookings.");
      setBookings([]);
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
        setError(bookingsLoadError(response));
        setBookings([]);
        return;
      }

      setBookings(normalizeBookings(response.data));
    } catch (loadError) {
      setError(getNetworkErrorMessage(loadError));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const review = useBookingReview(load);

  return (
    <div className="space-y-6">
      {showBookForm && <BookAppointmentForm onBooked={load} />}

      <div className="rounded-xl border border-teal-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-teal-800">My bookings</h2>

        {loading && <p className="mt-4 text-sm text-zinc-500">Loading bookings…</p>}
        {error && <ApiMessage message={error} variant="error" className="mt-4" />}

        {!loading && !error && bookings.length === 0 && (
          <p className="mt-4 text-sm text-zinc-500">No bookings yet.</p>
        )}

        <div className="mt-4 space-y-4">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === "CONFIRMED";
            const isPending = booking.status === "PENDING";

            return (
              <div
                key={booking.id}
                className="rounded-lg border border-teal-50 p-4 hover:bg-slate-50/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-800">
                        {booking.bookingDate} · {booking.startTime}–{booking.endTime}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_STYLES[booking.status] ?? "bg-zinc-100 text-zinc-600",
                        )}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">
                      {role === "DOCTOR"
                        ? `Patient: ${booking.patient.name}`
                        : `Doctor: ${booking.doctor.name} (${booking.doctor.specialization})`}
                    </p>
                    {booking.notes && (
                      <p className="mt-1 text-sm text-zinc-500">{booking.notes}</p>
                    )}
                    {booking.meetLink && (
                      <a
                        href={booking.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm font-medium text-teal-700 underline"
                      >
                        Join meeting
                      </a>
                    )}
                  </div>

                  {role === "DOCTOR" && isPending && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={review.actionId === booking.id}
                        onClick={() => review.requestApprove(booking.id)}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={review.actionId === booking.id}
                        onClick={() => review.requestDeny(booking.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </div>

                <PrescriptionSection
                  bookingId={booking.id}
                  role={role}
                  isConfirmed={isConfirmed}
                />
                <RecommendationSection
                  bookingId={booking.id}
                  role={role}
                  isConfirmed={isConfirmed}
                />
              </div>
            );
          })}
        </div>
      </div>

      <BookingReviewDialogs
        approveTargetId={review.approveTargetId}
        approveError={review.approveError}
        denyTargetId={review.denyTargetId}
        denyError={review.denyError}
        actionId={review.actionId}
        getTarget={(bookingId) => bookings.find((booking) => booking.id === bookingId)}
        onConfirmApprove={() => void review.confirmApprove()}
        onConfirmDeny={() => void review.confirmDeny()}
        onCancelApprove={review.cancelApprove}
        onCancelDeny={review.cancelDeny}
        denyConfirmLabel="Deny booking"
      />
    </div>
  );
}
