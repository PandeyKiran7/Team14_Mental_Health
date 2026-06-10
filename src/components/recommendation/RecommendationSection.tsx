"use client";

import { useCallback, useEffect, useState } from "react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { apiDownloadCall, apiGetCall, apiPostCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
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
          setBreakfast(data.dietPlan?.breakfast?.join(", ") ?? "");
          setLunch(data.dietPlan?.lunch?.join(", ") ?? "");
          setDinner(data.dietPlan?.dinner?.join(", ") ?? "");
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

  function splitList(value: string) {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const response = await apiPostCall({
        endpoint: "recommendation",
        pathParams: { bookingId },
        bookingId,
        advice,
        lifestyleChanges: lifestyleChanges || undefined,
        dietPlan: {
          breakfast: splitList(breakfast),
          lunch: splitList(lunch),
          dinner: splitList(dinner),
        },
        token: getAccessToken() ?? undefined,
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
    const result = await apiDownloadCall(
      "recommendation_download",
      { bookingId },
      `recommendation-${bookingId}.pdf`,
    );
    if (!result.ok) setError(result.message);
  }

  if (!isConfirmed) return null;
  if (loading) return <p className="text-sm text-zinc-500">Loading recommendation…</p>;

  const isDoctor = role === "DOCTOR";

  return (
    <div className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-medium text-teal-800">Recommendation</h4>
        <div className="flex gap-2">
          {recommendation && (
            <button
              type="button"
              onClick={() => void handleDownload()}
              className="text-xs font-medium text-teal-700 underline"
            >
              Download PDF
            </button>
          )}
          {isDoctor && !recommendation && (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="text-xs font-medium text-teal-700 underline"
            >
              {editing ? "Cancel" : "Add recommendation"}
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {editing && isDoctor ? (
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
      ) : recommendation ? (
        <div className="mt-3 space-y-2 text-sm text-zinc-700">
          <p>{recommendation.advice}</p>
          {recommendation.lifestyleChanges && (
            <p className="text-zinc-500">{recommendation.lifestyleChanges}</p>
          )}
          {recommendation.dietPlan && (
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
      ) : (
        <p className="mt-2 text-sm text-zinc-500">No recommendation yet.</p>
      )}
    </div>
  );
}
