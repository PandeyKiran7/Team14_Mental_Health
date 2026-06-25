"use client";

import { useEffect } from "react";
import ApiMessage from "@/components/ui/ApiMessage";

export default function DoctorBookingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Doctor bookings page error:", error);
  }, [error]);

  return (
    <div className="space-y-4 rounded-xl border border-teal-100 bg-white p-6">
      <ApiMessage
        message="Something went wrong loading appointments. Please refresh or try again."
        variant="error"
      />
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
      >
        Try again
      </button>
    </div>
  );
}
