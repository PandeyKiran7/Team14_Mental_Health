"use client";

import { useEffect, useState, useCallback } from "react";
import { getAccessToken } from "@/lib/auth";
import { apiGetCall } from "@/helper/apiService";
import { normalizeBookings } from "@/types/booking";
import { isApiSuccess } from "@/helper/apiErrors";
import type { Booking } from "@/types/booking";
import {
  downloadPrescriptionDocument,
  downloadRecommendationDocument,
} from "@/lib/downloadDocument";
import { normalizePrescription } from "@/types/prescription";
import { normalizeRecommendation } from "@/types/recommendation";
import {
  DownloadSimpleIcon,
  FileTextIcon,
  ClipboardTextIcon,
  InfoIcon,
} from "@phosphor-icons/react";
import ApiMessage from "@/components/ui/ApiMessage";

// Extend Booking locally to include optional report fields
interface BookingWithReports extends Booking {
  prescription?: any;
  recommendation?: any;
}

export default function ReportsPage() {
  const [bookings, setBookings] = useState<BookingWithReports[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({});

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getAccessToken();
    if (!token) {
      setError("Please log in to view reports.");
      setLoading(false);
      return;
    }

    try {
      const res = await apiGetCall({ endpoint: "bookings", token });
      if (!isApiSuccess(res.status)) {
        setError("Failed to load appointments.");
        setLoading(false);
        return;
      }

      const rawBookings = normalizeBookings(res.data);
      const activeBookings = rawBookings.filter(
        (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
      );

      // Fetch prescriptions and recommendations for each active booking in parallel
      const bookingsWithReports = await Promise.all(
        activeBookings.map(async (booking) => {
          try {
            const [presRes, recRes] = await Promise.all([
              apiGetCall({
                endpoint: "prescription",
                pathParams: { bookingId: booking.id },
                token,
              }),
              apiGetCall({
                endpoint: "recommendation",
                pathParams: { bookingId: booking.id },
                token,
              }),
            ]);

            const prescription =
              presRes.status === 200 ? normalizePrescription(presRes.data) : null;
            const recommendation =
              recRes.status === 200 ? normalizeRecommendation(recRes.data) : null;

            return {
              ...booking,
              prescription,
              recommendation,
            };
          } catch {
            return {
              ...booking,
              prescription: null,
              recommendation: null,
            };
          }
        })
      );

      setBookings(bookingsWithReports as BookingWithReports[]);
    } catch (err) {
      setError("An error occurred while loading your reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

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
    } catch (err) {
      alert(`Download failed: ${(err as Error).message}`);
    } finally {
      setDownloading((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-sm text-zinc-500 animate-pulse">Loading your reports and documents…</p>
      </div>
    );
  }

  if (error) {
    return <ApiMessage message={error} variant="error" />;
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

  // Helper to render report items as lists of clean cards or a modern table
  const renderTable = (
    items: Array<BookingWithReports & { data: any; type: "prescription" | "recommendation" }>,
    title: string,
    type: "prescription" | "recommendation"
  ) => {
    if (items.length === 0) return null;

    const iconColor = type === "prescription" ? "text-teal-600 bg-teal-50" : "text-indigo-600 bg-indigo-50";
    const SectionIcon = type === "prescription" ? PrescriptionIconWrapper : RecommendationIconWrapper;

    return (
      <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-zinc-100 pb-3">
          <span className={`p-2 rounded-lg ${iconColor}`}>
            <SectionIcon size={20} />
          </span>
          <h3 className="text-lg font-bold text-zinc-800">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-150">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Appointment ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Consulting Doctor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Consultation Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3.5 text-sm font-semibold text-zinc-700">
                    #{item.id}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-zinc-800">
                    <span className="font-medium text-zinc-900">Dr. {item.doctor?.name ?? "Practitioner"}</span>
                    <span className="block text-xs text-zinc-500">{item.doctor?.specialization ?? "General"}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-zinc-700">
                    {item.bookingDate} <span className="text-xs text-zinc-400">({item.startTime})</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleDownload(item.id, type, item.data)}
                      disabled={downloading[`${item.id}-${type}`]}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition shadow-sm"
                    >
                      <DownloadSimpleIcon size={14} weight="bold" />
                      {downloading[`${item.id}-${type}`] ? "Downloading…" : "Download PDF"}
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
      {/* Header section */}
      <div className="flex items-center space-x-3 rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
        <div className="rounded-lg bg-teal-50 p-3 text-teal-600">
          <FileTextIcon size={32} weight="duotone" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-800" id="reports-title">Medical Reports</h1>
          <p className="text-sm text-zinc-500">
            View and download medical prescriptions and diet/lifestyle recommendations provided by your doctors.
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center space-y-2">
          <p className="text-zinc-600 font-medium">You don’t have any appointments yet.</p>
          <p className="text-xs text-zinc-400">Appointments must be scheduled and completed to receive reports.</p>
        </div>
      ) : !hasPrescriptions && !hasRecommendations ? (
        <div className="rounded-xl border border-slate-100 bg-amber-50/40 p-6 flex items-start gap-3">
          <InfoIcon size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900">No reports available yet</h3>
            <p className="mt-1 text-xs text-amber-800">
              Your appointment status is active, but your consulting doctor has not issued any prescriptions or recommendations for your bookings yet. Once issued, they will appear here automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {hasPrescriptions && renderTable(prescriptions, "Prescriptions", "prescription")}
          {hasRecommendations && renderTable(recommendations, "Recommendations", "recommendation")}
        </div>
      )}
    </div>
  );
}

// Icon wrapper helper components to prevent phosphor-icons imports complexity
function PrescriptionIconWrapper(props: any) {
  return <FileTextIcon {...props} weight="duotone" />;
}

function RecommendationIconWrapper(props: any) {
  return <ClipboardTextIcon {...props} weight="duotone" />;
}