"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { loadMyBookings } from "@/lib/myBookings";
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

    try {
      const bookings = await loadMyBookings(token);
      const map = new Map<number, PatientOption>();

      for (const booking of bookings) {
        map.set(booking.patient.id, {
          userId: booking.patient.id,
          name: booking.patient.name,
        });
      }

      setPatients(Array.from(map.values()));
    } catch {
      setPatientsError("Could not load patient list. Check that the backend is running.");
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  const fetchMedicalData = useCallback(async (patientUserId: string) => {
    if (!patientUserId) {
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiGetCall({
        endpoint: "user_medical_data",
        pathParams: { userId: patientUserId },
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
    void fetchMedicalData(userId);
  }, [userId, fetchMedicalData]);

  const selectedPatient = useMemo(
    () => patients.find((p) => String(p.userId) === userId),
    [patients, userId],
  );

  return (
    <div className="rounded-xl border border-teal-100 bg-white p-6">
      <h2 className="text-lg font-semibold text-teal-800">Patient medical records</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Select a patient who booked an appointment with you. Their medical data loads
        automatically.
      </p>

      <div className="mt-4">
        <label htmlFor="patientSelect" className="mb-1 block text-sm font-medium text-zinc-700">
          Patient *
        </label>
        <Select
          id="patientSelect"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
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
              {p.name}
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
            <p className="text-sm text-zinc-500">{result.email}</p>
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
