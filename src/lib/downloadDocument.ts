import type { API_ENDPOINTS } from "@/helper/apiList";
import { apiDownloadCall } from "@/helper/apiService";
import {
  downloadPrescriptionPdf,
  downloadRecommendationPdf,
} from "@/lib/clientPdf";
import type { Prescription } from "@/types/prescription";
import type { Recommendation } from "@/types/recommendation";

type DownloadEndpoint = keyof Pick<
  typeof API_ENDPOINTS,
  "prescription_download" | "recommendation_download"
>;

async function downloadDocument<T>(
  bookingId: number,
  token: string | undefined,
  endpoint: DownloadEndpoint,
  filename: string,
  fallback: () => void | Promise<void>,
  fallbackError: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (token) {
    const apiResult = await apiDownloadCall(endpoint, { bookingId }, filename, token);
    if (apiResult.ok) return { ok: true };
  }

  try {
    await fallback();
    return { ok: true };
  } catch {
    return { ok: false, message: fallbackError };
  }
}

export function downloadPrescriptionDocument(
  bookingId: number,
  prescription: Prescription,
  token?: string,
) {
  return downloadDocument(
    bookingId,
    token,
    "prescription_download",
    `prescription-${bookingId}.pdf`,
    () => downloadPrescriptionPdf(bookingId, prescription),
    "Could not generate prescription PDF.",
  );
}

export function downloadRecommendationDocument(
  bookingId: number,
  recommendation: Recommendation,
  token?: string,
) {
  return downloadDocument(
    bookingId,
    token,
    "recommendation_download",
    `recommendation-${bookingId}.pdf`,
    () => downloadRecommendationPdf(bookingId, recommendation),
    "Could not generate recommendation PDF.",
  );
}
