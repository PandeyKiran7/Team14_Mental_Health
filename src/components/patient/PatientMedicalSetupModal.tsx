"use client";

import PatientMedicalDataForm from "@/components/patient/PatientMedicalDataForm";

type PatientMedicalSetupModalProps = {
  open: boolean;
  onComplete: () => void;
};

export default function PatientMedicalSetupModal({
  open,
  onComplete,
}: PatientMedicalSetupModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[1px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-medical-setup-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-teal-100 bg-white shadow-xl"
      >
        <div className="border-b border-teal-50 px-6 py-5">
          <h2
            id="patient-medical-setup-title"
            className="text-lg font-semibold text-teal-800"
          >
            Complete your medical profile
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Add your diabetes and health details before using appointments and
            other features.
          </p>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <PatientMedicalDataForm mandatory onComplete={onComplete} />
        </div>
      </div>
    </div>
  );
}
