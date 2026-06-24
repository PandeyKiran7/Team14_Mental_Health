"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { loadMyBookingsSafe } from "@/lib/myBookings";
import { Select } from "@/components/ui/select";
import {
  normalizeUserWithMedicalData,
  type UserWithMedicalData,
} from "@/types/admin";

type PatientOption = {
  userId: number;
  name: string;
};

function formatDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export default function PatientMedicalLookup() {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [manualUserId, setManualUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UserWithMedicalData | null>(null);

  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    setPatientsError(null);

    const token = getAccessToken();
    if (!token) {
      setPatients([]);
      setLoadingPatients(false);
      return;
    }

    const bookingsResult = await loadMyBookingsSafe(token);
    if (!bookingsResult.ok) {
      setPatientsError(bookingsResult.message);
      setPatients([]);
      setLoadingPatients(false);
      return;
    }

    const map = new Map<number, PatientOption>();
    for (const booking of bookingsResult.data) {
      map.set(booking.patient.id, {
        userId: booking.patient.id,
        name: booking.patient.name,
      });
    }

    setPatients(Array.from(map.values()));
    setLoadingPatients(false);
  }, []);

  const fetchMedicalData = useCallback(async (patientUserId: string) => {
    const trimmed = patientUserId.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) {
      setResult(null);
      setError(trimmed ? "User ID must be a number." : null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiGetCall({
        endpoint: "user_medical_data",
        pathParams: { userId: trimmed },
        token: getAccessToken() ?? undefined,
      });

      if (response.status !== API_CONSTANTS.success) {
        setError(getApiErrorMessage(response.data, "Patient not found."));
        return;
      }

      setResult(normalizeUserWithMedicalData(response.data));
    } catch {
      setError("Cannot reach backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (userId) {
      void fetchMedicalData(userId);
    }
  }, [userId, fetchMedicalData]);

  const selectedPatient = useMemo(
    () => patients.find((p) => String(p.userId) === userId),
    [patients, userId],
  );

  function handleManualLookup(event: React.FormEvent) {
    event.preventDefault();
    setUserId("");
    void fetchMedicalData(manualUserId);
  }

  return (
    <div className="rounded-xl border border-teal-100 bg-white p-6">
      <h2 className="text-lg font-semibold text-teal-800">Patient medical records</h2>

      <form onSubmit={handleManualLookup} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[12rem] flex-1">
          <label htmlFor="manualUserId" className="mb-1 block text-sm font-medium text-zinc-700">
            User ID
          </label>
          <input
            id="manualUserId"
            type="text"
            inputMode="numeric"
            value={manualUserId}
            onChange={(e) => setManualUserId(e.target.value)}
            placeholder="e.g. 1"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !manualUserId.trim()}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          Look up
        </button>
      </form>

      <div className="mt-4">
        <label htmlFor="patientSelect" className="mb-1 block text-sm font-medium text-zinc-700">
          Or select from booked patients
        </label>
        <Select
          id="patientSelect"
          value={userId}
          onChange={(e) => {
            setManualUserId("");
            setUserId(e.target.value);
          }}
          disabled={loadingPatients}
        >
          <option value="">
            {loadingPatients
              ? "Loading patients…"
              : patients.length === 0
                ? "No patients have booked with you yet"
                : "Select a patient"}
          </option>
          {patients.map((p) => (
            <option key={p.userId} value={p.userId}>
              {p.name} (User ID: {p.userId})
            </option>
          ))}
        </Select>
      </div>

      {patientsError && (
        <p className="mt-4 text-sm text-red-600">{patientsError}</p>
      )}

      {loading && (
        <p className="mt-4 text-sm text-zinc-500">Loading medical records…</p>
      )}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {result && !loading && (
        <div className="mt-6 space-y-4 border-t border-teal-100 pt-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
              Patient
            </p>
            <p className="mt-1 font-semibold text-zinc-800">
              {selectedPatient?.name ?? `${result.firstName} ${result.lastName}`}
            </p>
            <p className="text-sm text-zinc-500">
              User ID: {result.userId} · {result.email}
            </p>
          </div>

          {result.patient ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Diabetes type", value: result.patient.diabetesType },
                {
                  label: "Diagnosis date",
                  value: formatDate(result.patient.diagnosisDate),
                },
                { label: "Blood group", value: result.patient.bloodGroup },
                { label: "Height (cm)", value: result.patient.heightCM },
                { label: "Weight (kg)", value: result.patient.weightKG },
                {
                  label: "Glucose target",
                  value:
                    result.patient.targetGlucoseMin != null &&
                    result.patient.targetGlucoseMax != null
                      ? `${result.patient.targetGlucoseMin} – ${result.patient.targetGlucoseMax}`
                      : undefined,
                },
                { label: "Activity", value: result.patient.activityLevel },
                { label: "Diet", value: result.patient.dietaryPreference },
                {
                  label: "Emergency contact",
                  value: result.patient.emergencyContactName
                    ? `${result.patient.emergencyContactName} (${result.patient.emergencyContactPhone})`
                    : undefined,
                },
                { label: "Medication", value: result.patient.currentMedication },
                { label: "Symptoms", value: result.patient.symptoms },
              ].map((field) => (
                <div key={field.label}>
                  <dt className="text-xs text-zinc-500">{field.label}</dt>
                  <dd className="text-sm font-medium text-zinc-800">
                    {field.value ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-zinc-500">No medical data on file for this patient.</p>
          )}
        </div>
      )}
    </div>
  );
}
