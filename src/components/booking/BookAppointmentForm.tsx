"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getNetworkErrorMessage,
  isApiSuccess,
  resolveApiError,
} from "@/helper/apiErrors";
import { apiPostCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { loadBookableDoctors, type BookableDoctor } from "@/lib/bookableDoctors";
import { Select } from "@/components/ui/select";
import ApiMessage from "@/components/ui/ApiMessage";

type BookAppointmentFormProps = {
  onBooked: () => void;
  initialDoctorId?: number;
  hideDoctorSelector?: boolean;
};

function todayLocalDateValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookAppointmentForm({
  onBooked,
  initialDoctorId,
  hideDoctorSelector = false,
}: BookAppointmentFormProps) {
  const minBookingDate = todayLocalDateValue();
  const [doctorUserId, setDoctorUserId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<BookableDoctor[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => String(doctor.userId) === doctorUserId),
    [doctors, doctorUserId],
  );

  useEffect(() => {
    async function loadDoctors() {
      setLoadingDoctors(true);
      setError(null);

      const token = getAccessToken();
      if (!token) {
        setError("Please log in to book an appointment.");
        setLoadingDoctors(false);
        return;
      }

      const result = await loadBookableDoctors(token);
      setDoctors(result.doctors);
      if (result.error) {
        setError(result.error);
      }
      setLoadingDoctors(false);
    }

    void loadDoctors();
  }, []);

  useEffect(() => {
    if (initialDoctorId && doctors.length > 0) {
      const found = doctors.find((d) => d.userId === initialDoctorId);
      if (found) {
        setDoctorUserId(String(initialDoctorId));
      }
    }
  }, [initialDoctorId, doctors]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const token = getAccessToken();
    if (!token) {
      setError("Please log in to book an appointment.");
      setSaving(false);
      return;
    }

    if (!selectedDoctor) {
      setError("Please select a doctor.");
      setSaving(false);
      return;
    }

    if (!bookingDate) {
      setError("Please select a date.");
      setSaving(false);
      return;
    }

    if (bookingDate < minBookingDate) {
      setError("Booking date cannot be in the past.");
      setSaving(false);
      return;
    }

    if (endTime <= startTime) {
      setError("End time must be greater than start time.");
      setSaving(false);
      return;
    }

    try {
      const pathDoctorId = selectedDoctor.bookingDoctorId; 
      const payload = {
        bookingDate,
        startTime: startTime.slice(0, 5),
        endTime: endTime.slice(0, 5),
        notes: notes.trim() || undefined,
      };

      if (process.env.NODE_ENV === "development") {
        console.info("[Team14] POST book-appointment", {
          doctorUserId: selectedDoctor.userId,
          pathDoctorId,
          body: payload,
        });
      }

      const response = await apiPostCall({
        endpoint: "book_appointment",
        pathParams: { doctorId: pathDoctorId },
        ...payload,
        token,
      });

      if (!isApiSuccess(response.status)) {
        const apiError = resolveApiError(response, "Failed to book appointment.");
        setError(apiError);
        return;
      }

      setShowSuccessModal(true);
    } catch (submitError) {
      setError(getNetworkErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border border-teal-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-teal-800">Book appointment</h2>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          {!hideDoctorSelector && (
            <div>
              <label htmlFor="doctorUserId" className="mb-1 block text-sm font-medium text-zinc-700">
                Doctor *
              </label>
              <Select
                id="doctorUserId"
                required
                value={doctorUserId}
                onChange={(e) => setDoctorUserId(e.target.value)}
                disabled={loadingDoctors || doctors.length === 0}
              >
                <option value="">
                  {loadingDoctors
                    ? "Loading doctors…"
                    : doctors.length === 0
                    ? "No doctors available"
                    : "Select a doctor"}
                </option>
                {doctors.map((doctor) => (
                  <option key={doctor.userId} value={String(doctor.userId)}>
                    {doctor.name}
                    {doctor.specialization ? ` — ${doctor.specialization}` : ""}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Date *</label>
              <input
                type="date"
                required
                min={minBookingDate}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Start time *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">End time *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full resize-y rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {message && <ApiMessage message={message} variant="success" />}
          {error && <ApiMessage message={error} variant="error" />}

          <button
            type="submit"
            disabled={saving || loadingDoctors || doctors.length === 0}
            className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {saving ? "Booking…" : "Book appointment"}
          </button>
        </form>
      </div>

      {/* ✅ सफलता मोडल (popup) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-sm w-full rounded-xl bg-white p-6 shadow-xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Appointment Booked!</h3>
              <p className="mt-2 text-sm text-gray-600">
                Your appointment has been booked successfully.<br />
                Waiting for doctor approval.
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onBooked(); 
                }}
                className="mt-4 inline-flex w-full justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}