"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { isApiSuccess } from "@/helper/apiErrors";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import {
  normalizeUserDetail,
  normalizeUserWithMedicalData,
  type AdminUser,
  type UserWithMedicalData,
} from "@/types/admin";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

type AdminPatientDetailModalProps = {
  patient: AdminUser | null;
  onClose: () => void;
};

export default function AdminPatientDetailModal({
  patient,
  onClose,
}: AdminPatientDetailModalProps) {
  const [detail, setDetail] = useState<UserWithMedicalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patient) {
      setDetail(null);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const token = getAccessToken() ?? undefined;
        const [userRes, medicalRes] = await Promise.all([
          apiGetCall({
            endpoint: "user_by_id",
            pathParams: { userId: patient!.userId },
            token,
          }),
          apiGetCall({
            endpoint: "user_medical_data",
            pathParams: { userId: patient!.userId },
            token,
          }),
        ]);

        const user = isApiSuccess(userRes.status)
          ? normalizeUserDetail(userRes.data)
          : patient!;

        let medical: UserWithMedicalData | null = null;
        if (medicalRes.status === API_CONSTANTS.success) {
          medical = normalizeUserWithMedicalData(medicalRes.data);
        }

        setDetail({
          ...user!,
          patient: medical?.patient ?? null,
        });
      } catch {
        setError("Cannot reach backend.");
        setDetail({ ...patient!, patient: null });
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [patient]);

  if (!patient) return null;

  const accountFields = detail
    ? [
        { label: "User ID", value: String(detail.userId) },
        { label: "Name", value: `${detail.firstName} ${detail.lastName}` },
        { label: "Email", value: detail.email },
        { label: "Status", value: detail.isActive },
        { label: "Mobile", value: detail.mobileNumber },
        { label: "Gender", value: detail.gender },
        { label: "Address", value: detail.address },
        { label: "Joined", value: detail.createdAt },
      ]
    : [];

  const medicalFields = detail?.patient
    ? [
        { label: "Diabetes type", value: detail.patient.diabetesType },
        { label: "Diagnosis date", value: formatDate(detail.patient.diagnosisDate) },
        { label: "Blood group", value: detail.patient.bloodGroup },
        { label: "Height (cm)", value: detail.patient.heightCM },
        { label: "Weight (kg)", value: detail.patient.weightKG },
        {
          label: "Target glucose",
          value:
            detail.patient.targetGlucoseMin != null &&
            detail.patient.targetGlucoseMax != null
              ? `${detail.patient.targetGlucoseMin} – ${detail.patient.targetGlucoseMax}`
              : undefined,
        },
        { label: "Emergency contact", value: detail.patient.emergencyContactName },
        { label: "Emergency phone", value: detail.patient.emergencyContactPhone },
      ]
    : [];

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
              {patient.firstName} {patient.lastName} · {patient.email}
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

        {loading && <p className="mt-6 text-sm text-zinc-500">Loading…</p>}
        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {!loading && detail && (
          <div className="mt-6 space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-teal-800">Account</h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                {accountFields.map((field) => (
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
              {medicalFields.length > 0 ? (
                <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                  {medicalFields.map((field) => (
                    <div key={field.label}>
                      <dt className="text-zinc-500">{field.label}</dt>
                      <dd className="font-medium text-zinc-800">{field.value ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-zinc-500">No medical data on file yet.</p>
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
