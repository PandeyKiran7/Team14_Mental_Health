"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { EyeIcon, PencilIcon } from "@phosphor-icons/react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { normalizeUsers, type AdminUser } from "@/types/admin";
import AdminPatientDetailModal from "@/components/admin/AdminPatientDetailModal";
import AdminPatientEditModal from "@/components/admin/AdminPatientEditModal";
import AdminPatientMedicalLookup from "@/components/admin/AdminPatientMedicalLookup";
import UserStatusModal from "@/components/admin/UserStatusModal";

export default function AdminPatientsPanel({
  hideRegisterLink = false,
}: {
  hideRegisterLink?: boolean;
}) {
  const [patients, setPatients] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<AdminUser | null>(null);
  const [editPatient, setEditPatient] = useState<AdminUser | null>(null);
  const [statusPatient, setStatusPatient] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGetCall({
        endpoint: "patients",
        token: getAccessToken() ?? undefined,
      });

      if (response.status !== API_CONSTANTS.success) {
        setError(getApiErrorMessage(response.data, "Failed to load patients."));
        setPatients([]);
        return;
      }

      setPatients(normalizeUsers(response.data));
    } catch {
      setError("Cannot reach backend.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-8">
      {!hideRegisterLink && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/admin/users/register/patient"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Register patient
          </Link>
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-teal-100 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">Loading patients…</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && patients.length === 0 && (
        <div className="rounded-xl border border-teal-100 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">No patients registered yet.</p>
        </div>
      )}

      {!loading && !error && patients.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-teal-100 bg-white">
          <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-teal-100 bg-teal-50/60">
                <th className="px-4 py-3 font-semibold text-teal-900">User ID</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Name</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Email</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Status</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.userId} className="border-b border-teal-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{patient.userId}</td>
                  <td className="px-4 py-3 font-medium text-zinc-800">
                    {patient.firstName} {patient.lastName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{patient.email}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      title="Update status"
                      onClick={() => setStatusPatient(patient)}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium hover:opacity-80",
                        patient.isActive === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-500",
                      )}
                    >
                      {patient.isActive}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      title="View details"
                      onClick={() => setSelectedPatient(patient)}
                      className="mr-2 rounded border border-teal-200 p-2 hover:bg-teal-50"
                    >
                      <EyeIcon size={16} className="text-teal-800" />
                    </button>
                    <button
                      type="button"
                      title="Edit patient"
                      onClick={() => setEditPatient(patient)}
                      className="rounded border border-teal-200 p-2 hover:bg-teal-50"
                    >
                      <PencilIcon size={16} className="text-teal-800" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* <AdminPatientMedicalLookup key={patients.length} /> */}

      <AdminPatientDetailModal
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />

      <AdminPatientEditModal
        patient={editPatient}
        onClose={() => setEditPatient(null)}
        onUpdated={load}
      />

      <UserStatusModal
        user={statusPatient}
        onClose={() => setStatusPatient(null)}
        onUpdated={load}
      />
    </div>
  );
}
