"use client";

import { useCallback, useEffect, useState } from "react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { Select } from "@/components/ui/select";
import {
  normalizeUserWithMedicalData,
  normalizeUsers,
  type UserWithMedicalData,
} from "@/types/admin";

function formatDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export default function AdminPatientMedicalLookup() {
  const [patients, setPatients] = useState<{ userId: number; name: string }[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UserWithMedicalData | null>(null);

  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    setLoadError(null);

    try {
      const response = await apiGetCall({
        endpoint: "patients",
        token: getAccessToken() ?? undefined,
      });

      if (response.status !== API_CONSTANTS.success) {
        setLoadError(getApiErrorMessage(response.data, "Failed to load patients."));
        setPatients([]);
        return;
      }

      setPatients(
        normalizeUsers(response.data).map((p) => ({
          userId: p.userId,
          name: `${p.firstName} ${p.lastName}`,
        })),
      );
    } catch {
      setLoadError("Cannot reach backend.");
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (!userId) {
      setResult(null);
      setError(null);
      return;
    }

    async function fetchMedical() {
      setLoading(true);
      setError(null);

      try {
        const response = await apiGetCall({
          endpoint: "user_medical_data",
          pathParams: { userId },
          token: getAccessToken() ?? undefined,
        });

        if (response.status !== API_CONSTANTS.success) {
          setError(getApiErrorMessage(response.data, "Patient medical data not found."));
          setResult(null);
          return;
        }

        setResult(normalizeUserWithMedicalData(response.data));
      } catch {
        setError("Cannot reach backend.");
        setResult(null);
      } finally {
        setLoading(false);
      }
    }

    void fetchMedical();
  }, [userId]);

  return (
    <div className="rounded-xl border border-teal-100 bg-white p-6">
      <h2 className="text-lg font-semibold text-teal-800">Patient medical records</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Select a patient to view their diabetes profile and medical details.
      </p>

      <div className="mt-4">
        <label htmlFor="adminPatientSelect" className="mb-1 block text-sm font-medium text-zinc-700">
          Patient *
        </label>
        <Select
          id="adminPatientSelect"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={loadingPatients}
        >
          <option value="">
            {loadingPatients
              ? "Loading patients…"
              : patients.length === 0
                ? "No patients registered yet"
                : "Select a patient"}
          </option>
          {patients.map((p) => (
            <option key={p.userId} value={p.userId}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      {loadError && <p className="mt-4 text-sm text-red-600">{loadError}</p>}
      {loading && <p className="mt-4 text-sm text-zinc-500">Loading medical records…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {result && !loading && (
        <div className="mt-6 border-t border-teal-100 pt-6">
          <p className="font-semibold text-zinc-800">
            {result.firstName} {result.lastName}
          </p>
          <p className="text-sm text-zinc-500">{result.email}</p>

          {result.patient ? (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              {[
                { label: "Diabetes type", value: result.patient.diabetesType },
                { label: "Diagnosis date", value: formatDate(result.patient.diagnosisDate) },
                { label: "Blood group", value: result.patient.bloodGroup },
                { label: "Height (cm)", value: result.patient.heightCM },
                { label: "Weight (kg)", value: result.patient.weightKG },
              ].map((field) => (
                <div key={field.label}>
                  <dt className="text-zinc-500">{field.label}</dt>
                  <dd className="font-medium">{field.value ?? "—"}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">No medical data on file.</p>
          )}
        </div>
      )}
    </div>
  );
}
