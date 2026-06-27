"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";
import { apiGetCall } from "@/helper/apiService";
import { normalizeBookings } from "@/types/booking";
import { isApiSuccess } from "@/helper/apiErrors";
import type { Booking } from "@/types/booking";
import { downloadPrescriptionDocument, downloadRecommendationDocument } from "@/lib/downloadDocument";

// Extend Booking locally to include optional report fields
interface BookingWithReports extends Booking {
  prescription?: any; // replace 'any' with your actual Prescription type
  recommendation?: any; // replace 'any' with your actual Recommendation type
}

export default function ReportsPage() {
  const [bookings, setBookings] = useState<BookingWithReports[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    apiGetCall({ endpoint: "bookings", token })
      .then((res) => {
        if (isApiSuccess(res.status)) {
          // normalizeBookings should return an array with the extra fields
          setBookings(normalizeBookings(res.data) as BookingWithReports[]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (
    bookingId: number,
    type: "prescription" | "recommendation",
    data: any
  ) => {
    const token = getAccessToken();
    const key = `${bookingId}-${type}`;
    setDownloading((prev) => ({ ...prev, [key]: true }));

    try {
      const result =
        type === "prescription"
          ? await downloadPrescriptionDocument(bookingId, data, token ?? undefined)
          : await downloadRecommendationDocument(bookingId, data, token ?? undefined);

      if (!result.ok) {
        alert(result.message);
      }
    } catch (error) {
      alert(`Download failed: ${(error as Error).message}`);
    } finally {
      setDownloading((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading your reports…</p>;
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-teal-100 bg-white p-8 text-center">
        <p className="text-zinc-600">You don’t have any appointments yet.</p>
      </div>
    );
  }

  // Extract prescriptions and recommendations
  const prescriptions = bookings
    .filter((b) => b.prescription)
    .map((b) => ({ ...b, data: b.prescription, type: "prescription" as const }));

  const recommendations = bookings
    .filter((b) => b.recommendation)
    .map((b) => ({ ...b, data: b.recommendation, type: "recommendation" as const }));

  const hasPrescriptions = prescriptions.length > 0;
  const hasRecommendations = recommendations.length > 0;

  if (!hasPrescriptions && !hasRecommendations) {
    return (
      <div className="rounded-xl border border-teal-100 bg-white p-8 text-center">
        <p className="text-zinc-600">No reports are available for your appointments.</p>
      </div>
    );
  }

  // Helper to render a table for a given list
  const renderTable = (
    items: Array<BookingWithReports & { data: any; type: "prescription" | "recommendation" }>,
    title: string,
    type: "prescription" | "recommendation"
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="rounded-xl border border-teal-100 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-teal-800 mb-3">{title}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-teal-100">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-600">
                  Appointment
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-600">
                  Doctor
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-600">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-600">
                  Download
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50 bg-white">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-sm text-zinc-700">
                    #{item.id}
                  </td>
                  <td className="px-4 py-2 text-sm text-zinc-700">
                    Dr. {item.doctor?.name ?? "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-zinc-700">
                    {new Date(item.startTime).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDownload(item.id, type, item.data)}
                      disabled={downloading[`${item.id}-${type}`]}
                      className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                      {downloading[`${item.id}-${type}`]
                        ? "Downloading…"
                        : "Download"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-teal-800">Your Reports</h2>

      {hasPrescriptions && renderTable(prescriptions, "Prescriptions", "prescription")}
      {hasRecommendations && renderTable(recommendations, "Recommendations", "recommendation")}
    </div>
  );
}