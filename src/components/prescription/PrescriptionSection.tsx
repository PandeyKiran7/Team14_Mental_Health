"use client";

import { useCallback, useEffect, useState } from "react";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import {
  apiDownloadCall,
  apiGetCall,
  apiPatchCall,
  apiPostCall,
} from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import {
  normalizePrescription,
  type Medicine,
  type Prescription,
} from "@/types/prescription";

const emptyMedicine = (): Medicine => ({
  name: "",
  dose: "",
  frequency: "",
  duration: "",
});

type PrescriptionSectionProps = {
  bookingId: number;
  role: "DOCTOR" | "PATIENT";
  isConfirmed: boolean;
};

export default function PrescriptionSection({
  bookingId,
  role,
  isConfirmed,
}: PrescriptionSectionProps) {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([emptyMedicine()]);
  const [dosageInstructions, setDosageInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGetCall({
        endpoint: "prescription",
        pathParams: { bookingId },
        token: getAccessToken() ?? undefined,
      });

      if (response.status === API_CONSTANTS.success) {
        const data = normalizePrescription(response.data);
        setPrescription(data);
        if (data) {
          setMedicines(data.medicines);
          setDosageInstructions(data.dosageInstructions ?? "");
          setNotes(data.notes ?? "");
        }
      } else {
        setPrescription(null);
      }
    } catch {
      setPrescription(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (isConfirmed) void load();
    else setLoading(false);
  }, [isConfirmed, load]);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const payload = {
      bookingId,
      medicines,
      dosageInstructions: dosageInstructions || undefined,
      notes: notes || undefined,
      token: getAccessToken() ?? undefined,
    };

    try {
      const response = prescription
        ? await apiPatchCall({
            endpoint: "prescription",
            pathParams: { bookingId },
            medicines,
            token: getAccessToken() ?? undefined,
          })
        : await apiPostCall({
            ...payload,
            endpoint: "prescription",
            pathParams: { bookingId },
          });

      if (response.status !== 201 && response.status !== API_CONSTANTS.success) {
        setError(getApiErrorMessage(response.data, "Failed to save prescription."));
        return;
      }

      setEditing(false);
      await load();
    } catch {
      setError("Cannot reach backend.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    const result = await apiDownloadCall(
      "prescription_download",
      { bookingId },
      `prescription-${bookingId}.pdf`,
    );
    if (!result.ok) setError(result.message);
  }

  if (!isConfirmed) return null;
  if (loading) return <p className="text-sm text-zinc-500">Loading prescription…</p>;

  const isDoctor = role === "DOCTOR";

  return (
    <div className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-medium text-teal-800">Prescription</h4>
        <div className="flex gap-2">
          {prescription && (
            <button
              type="button"
              onClick={() => void handleDownload()}
              className="text-xs font-medium text-teal-700 underline"
            >
              Download PDF
            </button>
          )}
          {isDoctor && (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="text-xs font-medium text-teal-700 underline"
            >
              {editing ? "Cancel" : prescription ? "Edit" : "Add prescription"}
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {editing && isDoctor ? (
        <div className="mt-3 space-y-3">
          {medicines.map((med, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-4">
              {(["name", "dose", "frequency", "duration"] as const).map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  value={med[field]}
                  onChange={(e) => {
                    const next = [...medicines];
                    next[idx] = { ...next[idx], [field]: e.target.value };
                    setMedicines(next);
                  }}
                  className="rounded border border-zinc-200 px-2 py-1.5 text-sm"
                />
              ))}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMedicines((m) => [...m, emptyMedicine()])}
            className="text-xs text-teal-700 underline"
          >
            + Add medicine
          </button>
          <textarea
            placeholder="Dosage instructions"
            value={dosageInstructions}
            onChange={(e) => setDosageInstructions(e.target.value)}
            rows={2}
            className="w-full rounded border border-zinc-200 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded border border-zinc-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save prescription"}
          </button>
        </div>
      ) : prescription ? (
        <ul className="mt-3 space-y-2 text-sm text-zinc-700">
          {prescription.medicines.map((med, i) => (
            <li key={i}>
              <strong>{med.name}</strong> — {med.dose}, {med.frequency}, {med.duration}
            </li>
          ))}
          {prescription.dosageInstructions && (
            <li className="text-zinc-500">{prescription.dosageInstructions}</li>
          )}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-zinc-500">No prescription yet.</p>
      )}
    </div>
  );
}
