"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { EyeIcon, PencilIcon } from "@phosphor-icons/react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { normalizeUsers, type AdminUser } from "@/types/admin";
import AdminDoctorProfessionalModal from "@/components/admin/AdminDoctorProfessionalModal";
import AdminUserEditModal from "@/components/admin/AdminUserEditModal";
import UserStatusModal from "@/components/admin/UserStatusModal";

export default function AdminDoctorsPanel({
  hideRegisterLink = false,
}: {
  hideRegisterLink?: boolean;
}) {
  const [doctors, setDoctors] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<AdminUser | null>(null);
  const [editDoctor, setEditDoctor] = useState<AdminUser | null>(null);
  const [statusDoctor, setStatusDoctor] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGetCall({
        endpoint: "doctors",
        token: getAccessToken() ?? undefined,
      });

      if (response.status !== API_CONSTANTS.success) {
        setError(getApiErrorMessage(response.data, "Failed to load doctors."));
        setDoctors([]);
        return;
      }

      setDoctors(normalizeUsers(response.data));
    } catch {
      setError("Cannot reach backend.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      {!hideRegisterLink && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/admin/users/register/doctor"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Register doctor
          </Link>
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-teal-100 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">Loading doctors…</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && doctors.length === 0 && (
        <div className="rounded-xl border border-teal-100 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">No doctors registered yet.</p>
        </div>
      )}

      {!loading && !error && doctors.length > 0 && (
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
              {doctors.map((doctor) => (
                <tr key={doctor.userId} className="border-b border-teal-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{doctor.userId}</td>
                  <td className="px-4 py-3 font-medium text-zinc-800">
                    {doctor.firstName} {doctor.lastName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{doctor.email}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      title="Update status"
                      onClick={() => setStatusDoctor(doctor)}
                      className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 hover:bg-green-200"
                    >
                      {doctor.isActive}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      title="View account"
                      onClick={() => setSelectedDoctor(doctor)}
                      className="mr-2 rounded border border-teal-200 p-2 hover:bg-teal-50"
                    >
                      <EyeIcon size={16} className="text-teal-800" />
                    </button>
                    <button
                      type="button"
                      title="Edit account"
                      onClick={() => setEditDoctor(doctor)}
                      className="mr-2 rounded border border-teal-200 p-2 hover:bg-teal-50"
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

      <AdminDoctorProfessionalModal
        doctor={selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        onUpdated={load}
      />

      <AdminUserEditModal
        user={editDoctor}
        onClose={() => setEditDoctor(null)}
        onUpdated={load}
      />

      <UserStatusModal
        user={statusDoctor}
        onClose={() => setStatusDoctor(null)}
        onUpdated={load}
      />
    </div>
  );
}
