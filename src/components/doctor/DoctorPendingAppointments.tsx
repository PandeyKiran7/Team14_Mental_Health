"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { apiGetCall, apiPatchCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { normalizeBookings, type Booking } from "@/types/booking";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function DoctorPendingAppointments() {
  const [pending, setPending] = useState<Booking[]>([]);
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
        setError(getApiErrorMessage(response.data, "Failed to load appointments."));
        setPending([]);
        return;
      }

      const all = normalizeBookings(response.data);
      setPending(all.filter((b) => b.status === "PENDING"));
    } catch {
      setError("Cannot reach backend.");
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleApprove(bookingId: number) {
    setActionId(bookingId);
    setError(null);
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
    setError(null);
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
    <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-teal-800">Pending appointments</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Approve or deny patient requests. Patient sees status update on their side.
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
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

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
                disabled={actionId === booking.id}
                onClick={() => void handleApprove(booking.id)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={actionId === booking.id}
                onClick={() => setDenyTargetId(booking.id)}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={denyTargetId !== null}
        title="Deny appointment?"
        message="Are you sure you want to deny this appointment request? The patient will be notified."
        confirmLabel="Deny"
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
