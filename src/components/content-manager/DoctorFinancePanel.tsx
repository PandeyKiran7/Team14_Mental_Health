"use client";

import { useCallback, useEffect, useState } from "react";
import { CurrencyDollarIcon } from "@phosphor-icons/react";
import AdminDoctorFinanceModal from "@/components/admin/AdminDoctorFinanceModal";
import { getAccessToken } from "@/lib/auth";
import { getDoctorUsersFromAllUsers } from "@/lib/userApi";
import type { AdminUser } from "@/types/admin";

export default function DoctorFinancePanel() {
  const [doctors, setDoctors] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getDoctorUsersFromAllUsers(getAccessToken() ?? undefined);

    if (!result.ok) {
      setError(result.message);
      setDoctors([]);
      setLoading(false);
      return;
    }

    setDoctors(result.data.filter((doctor) => doctor.isActive === "ACTIVE"));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
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
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-teal-100 bg-teal-50/60">
                <th className="px-4 py-3 font-semibold text-teal-900">Doctor</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Email</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Status</th>
                <th className="px-4 py-3 font-semibold text-teal-900">Finance</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.userId} className="border-b border-teal-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-800">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{doctor.email}</td>
                  <td className="px-4 py-3">{doctor.isActive}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      title="View finance & pay salary"
                      onClick={() => setSelectedDoctor(doctor)}
                      className="rounded border border-teal-200 p-2 hover:bg-teal-50"
                    >
                      <CurrencyDollarIcon size={16} className="text-teal-800" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminDoctorFinanceModal
        doctor={selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
      />
    </div>
  );
}
