"use client";

import { useEffect, useState } from "react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { apiGetCall, apiPostCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { normalizeUsers } from "@/types/admin";

type DoctorOption = {
  userId: number;
  name: string;
};

type BookAppointmentFormProps = {
  onBooked: () => void;
};

export default function BookAppointmentForm({ onBooked }: BookAppointmentFormProps) {
  const [doctorId, setDoctorId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);

  useEffect(() => {
    async function loadDoctors() {
      setLoadingDoctors(true);
      const response = await apiGetCall({ endpoint: "users" });
      if (response.status === API_CONSTANTS.success) {
        const list = normalizeUsers(response.data)
          .filter((u) => u.role.toUpperCase() === "DOCTOR")
          .map((d) => ({
            userId: d.userId,
            name: `${d.firstName} ${d.lastName}`,
          }));
        setDoctors(list);
      }
      setLoadingDoctors(false);
    }
    void loadDoctors();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await apiPostCall({
        endpoint: "book_appointment",
        doctorId: Number(doctorId),
        bookingDate,
        startTime,
        endTime,
        notes: notes || undefined,
        token: getAccessToken() ?? undefined,
      });

      if (response.status !== 201 && response.status !== API_CONSTANTS.success) {
        setError(
          getApiErrorMessage(
            response.data,
            `Failed to book appointment (${response.status}).`,
          ),
        );
        return;
      }

      setMessage("Appointment booked successfully. Waiting for doctor approval.");
      setDoctorId("");
      setNotes("");
      onBooked();
    } catch {
      setError("Cannot reach backend.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-teal-800">Book appointment</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Select a doctor from the list below to book your appointment.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="doctorId" className="mb-1 block text-sm font-medium text-zinc-700">
            Doctor *
          </label>
          <select
            id="doctorId"
            required
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            disabled={loadingDoctors || doctors.length === 0}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
          >
            <option value="">
              {loadingDoctors
                ? "Loading doctors…"
                : doctors.length === 0
                  ? "No doctors available"
                  : "Select a doctor"}
            </option>
            {doctors.map((d) => (
              <option key={d.userId} value={d.userId}>
                Dr. {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Date *
            </label>
            <input
              type="date"
              required
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Start time *
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              End time *
            </label>
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

        {message && <p className="text-sm text-teal-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving || loadingDoctors || doctors.length === 0}
          className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? "Booking…" : "Book appointment"}
        </button>
      </form>
    </div>
  );
}
