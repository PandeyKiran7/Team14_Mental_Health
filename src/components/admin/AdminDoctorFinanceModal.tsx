"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import ApiMessage from "@/components/ui/ApiMessage";
import {
  fetchDoctorFinanceDetails,
  payDoctorSalary,
} from "@/lib/doctorFinanceApi";
import type { AdminUser } from "@/types/admin";
import type { DoctorFinanceDetails } from "@/types/doctorFinance";

type AdminDoctorFinanceModalProps = {
  doctor: AdminUser | null;
  onClose: () => void;
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminDoctorFinanceModal({
  doctor,
  onClose,
}: AdminDoctorFinanceModalProps) {
  const [details, setDetails] = useState<DoctorFinanceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!doctor) {
      setDetails(null);
      setError(null);
      setMessage(null);
      return;
    }

    async function loadFinance() {
      setLoading(true);
      setError(null);
      setMessage(null);

      const result = await fetchDoctorFinanceDetails(doctor!.userId);
      if (!result.ok) {
        setDetails(null);
        setError(result.message);
        setLoading(false);
        return;
      }

      setDetails(result.data);
      setLoading(false);
    }

    void loadFinance();
  }, [doctor]);

  if (!doctor) return null;

  async function handlePaySalary() {
    if (!details || !doctor) return;

    setPaying(true);
    setError(null);
    setMessage(null);

    const result = await payDoctorSalary(doctor.userId);
    if (!result.ok) {
      setError(result.message);
      setPaying(false);
      return;
    }

    setMessage(
      `Payout processed: ${formatMoney(result.data.totalAmount)} for ${result.data.totalPayments} payment(s).`,
    );
    setPaying(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-zinc-900/50"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-teal-100 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-teal-50 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-teal-800">Doctor finance</h2>
            <p className="mt-1 text-sm text-zinc-500">
              User ID: {doctor.userId} · {doctor.firstName} {doctor.lastName} · {doctor.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-teal-50"
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {loading && <p className="text-sm text-zinc-500">Loading finance details…</p>}

          {!loading && error && !details && (
            <ApiMessage message={error} variant="error" />
          )}

          {details && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Total revenue", value: formatMoney(details.summary.totalRevenue) },
                  { label: "Platform cut (20%)", value: formatMoney(details.summary.platformCut) },
                  { label: "Doctor earning (80%)", value: formatMoney(details.summary.doctorEarning) },
                  { label: "Paid bookings", value: String(details.summary.totalBookings) },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-800">{item.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-teal-800">Booking payments</h3>
                <div className="overflow-x-auto rounded-xl border border-teal-100">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-teal-100 bg-teal-50/60">
                        <th className="px-4 py-3 font-semibold text-teal-900">Booking</th>
                        <th className="px-4 py-3 font-semibold text-teal-900">Date</th>
                        <th className="px-4 py-3 font-semibold text-teal-900">Amount</th>
                        <th className="px-4 py-3 font-semibold text-teal-900">Doctor share</th>
                        <th className="px-4 py-3 font-semibold text-teal-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.bookings.map((booking) => (
                        <tr key={booking.bookingId} className="border-b border-teal-50 last:border-0">
                          <td className="px-4 py-3">#{booking.bookingId}</td>
                          <td className="px-4 py-3 text-zinc-600">
                            {booking.date ? new Date(booking.date).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-3">{formatMoney(booking.amount)}</td>
                          <td className="px-4 py-3">{formatMoney(booking.doctorEarning)}</td>
                          <td className="px-4 py-3 capitalize">{booking.paymentStatus.toLowerCase()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {message && <ApiMessage message={message} variant="success" />}
              {error && <ApiMessage message={error} variant="error" />}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={paying || details.summary.doctorEarning <= 0}
                  onClick={() => void handlePaySalary()}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {paying ? "Processing…" : "Pay salary"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
