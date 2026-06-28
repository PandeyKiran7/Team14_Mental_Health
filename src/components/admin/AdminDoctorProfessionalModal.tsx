"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import type { AdminUser } from "@/types/admin";
import { apiGetCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { API_CONSTANTS } from "@/constants/staticConstant";

type AdminDoctorProfessionalModalProps = {
  doctor: AdminUser | null;
  onClose: () => void;
  onUpdated?: () => void;
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminDoctorProfessionalModal({
  doctor,
  onClose,
}: AdminDoctorProfessionalModalProps) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctor) {
      setProfile(null);
      setError(null);
      return;
    }

    async function loadDetails() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiGetCall({
          endpoint: "view_profile",
          pathParams: { userId: doctor!.userId },
          token: getAccessToken() ?? undefined,
        });

        if (response.status === 404) {
          setProfile(null);
          return;
        }

        if (response.status !== API_CONSTANTS.success) {
          setError("Failed to load professional details.");
          return;
        }

        const body = response.data as any;
        const data = body.message || body.data || body;
        setProfile(data);
      } catch {
        setError("Cannot reach backend.");
      } finally {
        setLoading(false);
      }
    }

    void loadDetails();
  }, [doctor]);

  if (!doctor) return null;

  const details = profile?.doctor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-zinc-900/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-xl border border-teal-100 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-teal-800">Doctor account</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {doctor.firstName} {doctor.lastName} · {doctor.email}
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

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-teal-800 uppercase tracking-wider mb-3">Account Details</h3>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-zinc-500">Name</dt>
              <dd className="font-medium text-zinc-800">{doctor.firstName} {doctor.lastName}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="font-medium text-zinc-800">{doctor.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Mobile</dt>
              <dd className="font-medium text-zinc-800">{profile?.mobileNumber || "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Gender</dt>
              <dd className="font-medium capitalize text-zinc-800">{profile?.gender?.toLowerCase() || "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Date of Birth</dt>
              <dd className="font-medium text-zinc-800">
                {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Address</dt>
              <dd className="font-medium text-zinc-800">{profile?.address || "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Status</dt>
              <dd className="font-medium capitalize text-zinc-800">{doctor.isActive}</dd>
            </div>
          </dl>
        </div>

        {loading && (
          <div className="mt-6 border-t border-teal-100 pt-6 flex justify-center py-6">
            <p className="text-sm text-zinc-500">Loading professional details…</p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 border-t border-teal-100 pt-6">
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && !details && (
          <div className="mt-6 border-t border-teal-100 pt-6">
            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700">No professional details set yet for this doctor.</p>
            </div>
          </div>
        )}

        {!loading && !error && details && (
          <div className="mt-6 border-t border-teal-100 pt-6">
            <h3 className="text-sm font-semibold text-teal-800 uppercase tracking-wider mb-4">Professional & Medical Details</h3>
            <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-zinc-500">License number</dt>
                <dd className="font-medium text-zinc-800">{details.licenseNumber}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Qualification</dt>
                <dd className="font-medium text-zinc-800">{details.qualification}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Specialization</dt>
                <dd className="font-medium text-zinc-800">{details.specialization}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Years of Experience</dt>
                <dd className="font-medium text-zinc-800">{details.yearsOfExperience} years</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Consultation Fee</dt>
                <dd className="font-medium text-zinc-800">{formatMoney(details.consultationFee)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Availability</dt>
                <dd className="font-medium text-zinc-800">
                  {details.availableFrom} – {details.availableTo}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">Available Days</dt>
                <dd className="font-medium text-zinc-800">
                  {details.availableDays && details.availableDays.length > 0
                    ? details.availableDays.map((d: string) => d.charAt(0) + d.slice(1).toLowerCase()).join(", ")
                    : "None"}
                </dd>
              </div>
              {details.biography && (
                <div className="sm:col-span-2 mt-2">
                  <dt className="text-zinc-500">Biography</dt>
                  <dd className="mt-1 font-medium text-zinc-800 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                    {details.biography}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <div className="mt-6 flex justify-end border-t border-teal-50 pt-4">
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
