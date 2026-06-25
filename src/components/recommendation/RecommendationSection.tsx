"use client";

import { useCallback, useEffect, useState } from "react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { apiGetCall, apiPatchCall, apiPostCall } from "@/helper/apiService";
import BookingDocumentSection from "@/components/booking/BookingDocumentSection";
import { getAccessToken } from "@/lib/auth";
import { downloadRecommendationDocument } from "@/lib/downloadDocument";
import { joinCommaList, splitCommaList } from "@/lib/splitList";
import {
  normalizeRecommendation,
  type Recommendation,
} from "@/types/recommendation";

type RecommendationSectionProps = {
  bookingId: number;
  role: "DOCTOR" | "PATIENT";
  isConfirmed: boolean;
};

export default function RecommendationSection({
  bookingId,
  role,
  isConfirmed,
}: RecommendationSectionProps) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [advice, setAdvice] = useState("");
  const [lifestyleChanges, setLifestyleChanges] = useState("");
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGetCall({
        endpoint: "recommendation",
        pathParams: { bookingId },
        token: getAccessToken() ?? undefined,
      });

      if (response.status === API_CONSTANTS.success) {
        const data = normalizeRecommendation(response.data);
        setRecommendation(data);
        if (data) {
          setAdvice(data.advice);
          setLifestyleChanges(data.lifestyleChanges ?? "");
          setBreakfast(joinCommaList(data.dietPlan?.breakfast));
          setLunch(joinCommaList(data.dietPlan?.lunch));
          setDinner(joinCommaList(data.dietPlan?.dinner));
        }
      } else {
        setRecommendation(null);
      }
    } catch {
      setRecommendation(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (isConfirmed) void load();
    else setLoading(false);
  }, [isConfirmed, load]);

  function buildPayload() {
    return {
      advice,
      lifestyleChanges: lifestyleChanges || undefined,
      dietPlan: {
        breakfast: splitCommaList(breakfast),
        lunch: splitCommaList(lunch),
        dinner: splitCommaList(dinner),
      },
    };
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const token = getAccessToken() ?? undefined;
    const body = buildPayload();

    try {
      const response = recommendation
        ? await apiPatchCall({
            endpoint: "recommendation",
            pathParams: { bookingId },
            ...body,
            token,
          })
        : await apiPostCall({
            endpoint: "recommendation",
            pathParams: { bookingId },
            bookingId,
            ...body,
            token,
          });

      if (response.status !== 201 && response.status !== API_CONSTANTS.success) {
        setError(getApiErrorMessage(response.data, "Failed to save recommendation."));
        return;
      }

      setEditing(false);
      await load();
    } catch {
      setError("Cannot reach backend.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    if (!recommendation) return;

    const token = getAccessToken();
    if (!token) {
      setError("Please log in to download the recommendation.");
      return;
    }

    setDownloading(true);
    setError(null);

    const result = await downloadRecommendationDocument(bookingId, recommendation, token);
    if (!result.ok) setError(result.message);
    setDownloading(false);
  }

  if (!isConfirmed) return null;

  const isDoctor = role === "DOCTOR";

  return (
    <BookingDocumentSection
      title="Recommendation"
      error={error}
      loading={loading}
      loadingLabel="Loading recommendation…"
      exists={Boolean(recommendation)}
      isDoctor={isDoctor}
      editing={editing}
      saving={saving}
      downloading={downloading}
      editLabel={recommendation ? "Edit" : "Add recommendation"}
      emptyLabel="No recommendation yet."
      onToggleEdit={() => setEditing((value) => !value)}
      onDownload={() => void handleDownload()}
      form={
        <div className="mt-3 space-y-3">
          <textarea
            placeholder="Medical advice *"
            required
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            rows={3}
            className="w-full rounded border border-zinc-200 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Lifestyle changes"
            value={lifestyleChanges}
            onChange={(e) => setLifestyleChanges(e.target.value)}
            rows={2}
            className="w-full rounded border border-zinc-200 px-3 py-2 text-sm"
          />
          <input
            placeholder="Breakfast (comma-separated)"
            value={breakfast}
            onChange={(e) => setBreakfast(e.target.value)}
            className="w-full rounded border border-zinc-200 px-3 py-2 text-sm"
          />
          <input
            placeholder="Lunch (comma-separated)"
            value={lunch}
            onChange={(e) => setLunch(e.target.value)}
            className="w-full rounded border border-zinc-200 px-3 py-2 text-sm"
          />
          <input
            placeholder="Dinner (comma-separated)"
            value={dinner}
            onChange={(e) => setDinner(e.target.value)}
            className="w-full rounded border border-zinc-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={saving || advice.length < 3}
            onClick={() => void handleSave()}
            className="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save recommendation"}
          </button>
        </div>
      }
      view={
        <div className="mt-3 space-y-2 text-sm text-zinc-700">
          <p>{recommendation?.advice}</p>
          {recommendation?.lifestyleChanges && (
            <p className="text-zinc-500">{recommendation.lifestyleChanges}</p>
          )}
          {recommendation?.dietPlan && (
            <ul className="list-disc pl-5 text-zinc-600">
              {recommendation.dietPlan.breakfast?.length ? (
                <li>Breakfast: {recommendation.dietPlan.breakfast.join(", ")}</li>
              ) : null}
              {recommendation.dietPlan.lunch?.length ? (
                <li>Lunch: {recommendation.dietPlan.lunch.join(", ")}</li>
              ) : null}
              {recommendation.dietPlan.dinner?.length ? (
                <li>Dinner: {recommendation.dietPlan.dinner.join(", ")}</li>
              ) : null}
            </ul>
          )}
        </div>
      }
    />
  );
}
