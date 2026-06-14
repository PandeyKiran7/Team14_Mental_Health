"use client";

import { XIcon } from "@phosphor-icons/react";
import ApiMessage from "@/components/ui/ApiMessage";
import type { AdminUser } from "@/types/admin";

type AdminDoctorProfessionalModalProps = {
  doctor: AdminUser | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function AdminDoctorProfessionalModal({
  doctor,
  onClose,
}: AdminDoctorProfessionalModalProps) {
  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-zinc-900/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-teal-100 bg-white p-6">
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

        <ApiMessage
          variant="info"
          className="mt-6"
          message="Professional profile details are added by the doctor after they log in. Admin can only view the account here."
        />

        <dl className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
          {[
            { label: "Name", value: `${doctor.firstName} ${doctor.lastName}` },
            { label: "Email", value: doctor.email },
            { label: "Role", value: doctor.role },
            { label: "Status", value: doctor.isActive },
          ].map((field) => (
            <div key={field.label}>
              <dt className="text-zinc-500">{field.label}</dt>
              <dd className="font-medium capitalize text-zinc-800">{field.value}</dd>
            </div>
          ))}
        </dl>

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
