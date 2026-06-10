"use client";

import { useCallback, useEffect, useState } from "react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { apiGetCall, apiPatchCall } from "@/helper/apiService";
import { getAccessToken, getStoredUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { normalizeBookings, type Booking } from "@/types/booking";
import BookAppointmentForm from "@/components/booking/BookAppointmentForm";
import PrescriptionSection from "@/components/prescription/PrescriptionSection";
import RecommendationSection from "@/components/recommendation/RecommendationSection";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-sky-100 text-sky-800",
};

type BookingsPanelProps = {
  showBookForm?: boolean;
};

export default function BookingsPanel({ showBookForm = false }: BookingsPanelProps) {
  const role = (getStoredUser()?.role ?? "PATIENT").toUpperCase() as
    | "DOCTOR"
    | "PATIENT";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [denyTargetId, setDenyTargetId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGetCall({
        endpoint: "bookings",
        token: getAccessToken() ?? undefined,
      });

      if (response.status !== API_CONSTANTS.success) {
        setError(getApiErrorMessage(response.data, "Failed to load bookings."));
        setBookings([]);
        return;
      }

      setBookings(normalizeBookings(response.data));
    } catch {
      setError("Cannot reach backend.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleApprove(bookingId: number) {
    setActionId(bookingId);
    try {
      const response = await apiPatchCall({
        endpoint: "approve_booking",
        pathParams: { bookingId },
        token: getAccessToken() ?? undefined,
      });
      if (response.status !== API_CONSTANTS.success) {
        setError(getApiErrorMessage(response.data, "Failed to approve."));
      } else {
        await load();
      }
    } finally {
      setActionId(null);
    }
  }

  async function handleDeny(bookingId: number) {
    setActionId(bookingId);
    try {
      const response = await apiPatchCall({
        endpoint: "deny_booking",
        pathParams: { bookingId },
        token: getAccessToken() ?? undefined,
      });
      if (response.status !== API_CONSTANTS.success) {
        setError(getApiErrorMessage(response.data, "Failed to deny."));
      } else {
        setDenyTargetId(null);
        await load();
      }
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {showBookForm && <BookAppointmentForm onBooked={load} />}

      <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-teal-800">My bookings</h2>

        {loading && <p className="mt-4 text-sm text-zinc-500">Loading bookings…</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

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
                        disabled={actionId === booking.id}
                        onClick={() => void handleApprove(booking.id)}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={actionId === booking.id}
                        onClick={() => setDenyTargetId(booking.id)}
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

      <ConfirmDialog
        open={denyTargetId !== null}
        title="Deny booking?"
        message="Are you sure you want to deny this appointment request? The patient will be notified."
        confirmLabel="Deny booking"
        cancelLabel="Cancel"
        variant="danger"
        loading={actionId === denyTargetId}
        onConfirm={() => {
          if (denyTargetId !== null) void handleDeny(denyTargetId);
        }}
        onCancel={() => {
          if (actionId === null) setDenyTargetId(null);
        }}
      />
    </div>
  );
}
