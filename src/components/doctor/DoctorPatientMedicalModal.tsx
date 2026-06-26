"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage, getNetworkErrorMessage } from "@/helper/apiErrors";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import ApiMessage from "@/components/ui/ApiMessage";
import {
  normalizeUserWithMedicalData,
  type UserWithMedicalData,
} from "@/types/admin";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

type DoctorPatientMedicalModalProps = {
  userId: number | null;
  patientName?: string;
  onClose: () => void;
};

export default function DoctorPatientMedicalModal({
  userId,
  patientName,
  onClose,
}: DoctorPatientMedicalModalProps) {
  const [result, setResult] = useState<UserWithMedicalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setResult(null);
      setError(null);
      return;
    }

    const patientUserId = userId;

    async function load() {
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
        setError(getNetworkErrorMessage(new Error("fetch failed")));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [userId]);

  if (!userId) return null;

  const displayName =
    patientName ??
    (result ? `${result.firstName} ${result.lastName}`.trim() : "Patient");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-zinc-900/50"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto scrollbar-hide rounded-xl border border-teal-100 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-teal-800">Patient details</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {displayName} · User ID: {userId}
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

        {loading && (
          <p className="mt-6 text-sm text-zinc-500">Loading medical records…</p>
        )}
        {error && <ApiMessage message={error} className="mt-6" />}

        {result && !loading && (
          <div className="mt-6 space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-teal-800">Account</h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                {[
                  { label: "Email", value: result.email },
                  { label: "Mobile", value: result.mobileNumber },
                  { label: "Gender", value: result.gender },
                  { label: "Address", value: result.address },
                ].map((field) => (
                  <div key={field.label}>
                    <dt className="text-zinc-500">{field.label}</dt>
                    <dd className="font-medium capitalize text-zinc-800">
                      {field.value ?? "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="border-t border-teal-100 pt-6">
              <h3 className="text-sm font-semibold text-teal-800">Medical profile</h3>
              {result.patient ? (
                <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
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
                      <dt className="text-zinc-500">{field.label}</dt>
                      <dd className="font-medium text-zinc-800">{field.value ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-zinc-500">
                  No medical data on file for this patient.
                </p>
              )}
            </section>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
