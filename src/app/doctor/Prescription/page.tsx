"use client";

import { useEffect, useState, useCallback } from "react";
import { getAccessToken } from "@/lib/auth";
import { loadMyBookingsSafe } from "@/lib/myBookings";
import { type Booking } from "@/types/booking";
import PrescriptionSection from "@/components/prescription/PrescriptionSection";
import ApiMessage from "@/components/ui/ApiMessage";
import { ClipboardText } from "@phosphor-icons/react";

export default function DoctorPrescriptionPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getAccessToken();
    if (!token) {
      setError("Please log in to manage prescriptions.");
      setLoading(false);
      return;
    }

    const result = await loadMyBookingsSafe(token);
    if (result.ok) {
      // Filter only CONFIRMED or COMPLETED bookings
      const activeBookings = result.data.filter(
        (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
      );
      setBookings(activeBookings);
      if (activeBookings.length > 0) {
        setSelectedBookingId(activeBookings[0].id);
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3 rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
        <div className="rounded-lg bg-teal-50 p-3 text-teal-600">
          <ClipboardText size={32} weight="duotone" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-800" id="prescriptions-title">Prescriptions</h1>
          <p className="text-sm text-zinc-500">
            Create, edit, and download prescriptions for your confirmed and completed appointments.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <p className="text-sm text-zinc-500 animate-pulse">Loading appointments…</p>
        </div>
      )}

      {error && <ApiMessage message={error} variant="error" />}

      {!loading && !error && bookings.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white py-12 text-center">
          <p className="text-zinc-500">No confirmed or completed appointments found.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Prescriptions can only be created for approved appointments.
          </p>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Bookings List (Left Column) */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 px-1">
              Select Appointment
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {bookings.map((booking) => {
                const isSelected = booking.id === selectedBookingId;
                return (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBookingId(booking.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "border-teal-500 bg-teal-50/40 shadow-sm"
                        : "border-zinc-200 bg-white hover:bg-zinc-50/50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-zinc-800">
                        {booking.patient.name}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          booking.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-teal-50 text-teal-700 border border-teal-200"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      User ID: {booking.patient.id}
                    </p>
                    <p className="text-xs font-medium text-zinc-600 mt-2">
                      {booking.bookingDate}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prescription Section (Right Column) */}
          <div className="lg:col-span-8">
            {selectedBooking ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                <div className="border-b border-zinc-100 pb-4">
                  <h2 className="text-lg font-bold text-zinc-800">
                    Prescription for {selectedBooking.patient.name}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Appointment on {selectedBooking.bookingDate} at {selectedBooking.startTime}
                  </p>
                </div>
                <PrescriptionSection
                  bookingId={selectedBooking.id}
                  role="DOCTOR"
                  isConfirmed={true}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-250 bg-white p-12 text-center">
                <p className="text-zinc-500">Please select an appointment from the list.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
