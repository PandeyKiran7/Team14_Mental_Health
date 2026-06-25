"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormButton from "@/components/formElements/FormButton";
import FormInput from "@/components/formElements/FormInput";
import FormField from "@/components/formElements/FormField";
import ProfileDetailGrid from "@/components/profile/ProfileDetailGrid";
import ProfileEditButton from "@/components/profile/ProfileEditButton";
import ProfileSection from "@/components/profile/ProfileSection";
import ApiMessage from "@/components/ui/ApiMessage";
import { getNetworkErrorMessage } from "@/helper/apiErrors";
import {
  fetchDoctorProfessionalDetails,
  getCachedDoctorProfessionalDetails,
  saveDoctorProfessionalDetails,
  type DoctorProfessionalFetchResult,
} from "@/lib/doctorProfessionalApi";
import {
  doctorDataToForm,
  emptyDoctorProfessionalForm,
  formatWeekDay,
  formToDoctorPayload,
  weekDays,
} from "@/lib/doctorForm";

const BIOGRAPHY_MAX_LENGTH = 1000;

type DoctorProfileFormProps = {
  mandatory?: boolean;
  onComplete?: () => void;
};

function formatAverageRating(value: number | string | null | undefined): string | undefined {
  if (value == null || value === "") return undefined;
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) return undefined;
  return `${numeric.toFixed(1)} / 5`;
}

function readAverageRating(doctor: { averageRating?: number | string | null }) {
  if (typeof doctor.averageRating === "number") return doctor.averageRating;
  if (doctor.averageRating != null) {
    const numeric = Number(doctor.averageRating);
    return Number.isNaN(numeric) ? null : numeric;
  }
  return null;
}

function initialStateFromCache() {
  const cached = getCachedDoctorProfessionalDetails();
  if (!cached?.ok) {
    return {
      form: emptyDoctorProfessionalForm,
      snapshot: emptyDoctorProfessionalForm,
      averageRating: null as number | null,
      hasRecord: false,
      editing: false,
      loading: !cached,
      error: cached && !cached.ok ? cached.message : null,
    };
  }

  if (!cached.data) {
    return {
      form: emptyDoctorProfessionalForm,
      snapshot: emptyDoctorProfessionalForm,
      averageRating: null as number | null,
      hasRecord: false,
      editing: true,
      loading: false,
      error: null as string | null,
    };
  }

  const values = doctorDataToForm(cached.data);
  return {
    form: values,
    snapshot: values,
    averageRating: readAverageRating(cached.data),
    hasRecord: true,
    editing: false,
    loading: false,
    error: null as string | null,
  };
}

function applyFetchResult(result: DoctorProfessionalFetchResult) {
  if (!result.ok) {
    return {
      form: emptyDoctorProfessionalForm,
      snapshot: emptyDoctorProfessionalForm,
      averageRating: null as number | null,
      hasRecord: false,
      editing: true,
      error: result.message,
    };
  }

  if (!result.data) {
    return {
      form: emptyDoctorProfessionalForm,
      snapshot: emptyDoctorProfessionalForm,
      averageRating: null as number | null,
      hasRecord: false,
      editing: true,
      error: null as string | null,
    };
  }

  const values = doctorDataToForm(result.data);
  return {
    form: values,
    snapshot: values,
    averageRating: readAverageRating(result.data),
    hasRecord: true,
    editing: false,
    error: null as string | null,
  };
}

export default function DoctorProfileForm({
  mandatory = false,
  onComplete,
}: DoctorProfileFormProps = {}) {
  const router = useRouter();
  const initial = initialStateFromCache();
  const [form, setForm] = useState(initial.form);
  const [snapshot, setSnapshot] = useState(initial.snapshot);
  const [averageRating, setAverageRating] = useState<number | null>(initial.averageRating);
  const [hasRecord, setHasRecord] = useState(initial.hasRecord);
  const [loading, setLoading] = useState(initial.loading);
  const [editing, setEditing] = useState(initial.editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(initial.error);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initial.loading) return;

    let cancelled = false;

    async function loadData() {
      try {
        const result = await fetchDoctorProfessionalDetails();

        if (cancelled) return;

        const next = applyFetchResult(result);
        setForm(next.form);
        setSnapshot(next.snapshot);
        setAverageRating(next.averageRating);
        setHasRecord(next.hasRecord);
        setEditing(next.editing);
        setError(next.error);
      } catch (loadError) {
        if (!cancelled) {
          setError(getNetworkErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [initial.loading]);

  function updateField(
    field: keyof typeof emptyDoctorProfessionalForm,
    value: string | string[],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDay(day: (typeof weekDays)[number]) {
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  }

  function handleCancelEdit() {
    setForm(snapshot);
    setEditing(false);
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (form.availableDays.length === 0) {
      setError("Select at least one available day.");
      return;
    }

    if (form.biography.trim().length > BIOGRAPHY_MAX_LENGTH) {
      setError(`Biography must be ${BIOGRAPHY_MAX_LENGTH} characters or fewer.`);
      return;
    }

    setSaving(true);
    const payload = formToDoctorPayload(form);
    const wasNewRecord = !hasRecord;

    try {
      const result = await saveDoctorProfessionalDetails(payload, {
        create: wasNewRecord,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setHasRecord(true);
      setSnapshot(form);

      if (wasNewRecord) {
        if (onComplete) {
          onComplete();
        } else {
          router.push("/doctor/dashboard");
        }
        return;
      }

      setEditing(false);
      setMessage("Professional profile updated successfully.");
    } catch (saveError) {
      setError(getNetworkErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  const formContent = (
    <>
      {hasRecord && !editing && !mandatory ? (
        <div className="space-y-4">
          <ProfileDetailGrid
            items={[
              { label: "License number", value: form.licenseNumber },
              { label: "Qualification", value: form.qualification },
              { label: "Specialization", value: form.specialization },
              { label: "Years of experience", value: form.yearsOfExperience },
              { label: "Consultation fee", value: form.consultationFee },
              {
                label: "Availability",
                value: `${form.availableFrom} – ${form.availableTo}`,
              },
              {
                label: "Available days",
                value: form.availableDays.map(formatWeekDay).join(", "),
              },
              {
                label: "Average rating",
                value: formatAverageRating(averageRating),
              },
              { label: "Biography", value: form.biography },
            ]}
          />
          {message && <ApiMessage message={message} variant="success" />}
          {error && <ApiMessage message={error} variant="error" />}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              name="licenseNumber"
              label="License number"
              placeholder="DOC-NEP-2026-111"
              value={form.licenseNumber}
              onChange={(e) => updateField("licenseNumber", e.target.value)}
              required
            />
            <FormInput
              name="qualification"
              label="Qualification"
              placeholder="MBBS, MD (Endocrinology)"
              value={form.qualification}
              onChange={(e) => updateField("qualification", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              name="specialization"
              label="Specialization"
              placeholder="Diabetologist"
              value={form.specialization}
              onChange={(e) => updateField("specialization", e.target.value)}
              required
            />
            <FormInput
              name="yearsOfExperience"
              type="number"
              label="Years of experience"
              value={form.yearsOfExperience}
              onChange={(e) => updateField("yearsOfExperience", e.target.value)}
              required
              min={0}
              max={60}
            />
          </div>

          <FormField
            label="Biography"
            htmlFor="biography"
            required
            hint={`${form.biography.length}/${BIOGRAPHY_MAX_LENGTH} characters`}
          >
            <textarea
              id="biography"
              name="biography"
              rows={4}
              value={form.biography}
              onChange={(e) => updateField("biography", e.target.value)}
              required
              minLength={10}
              maxLength={BIOGRAPHY_MAX_LENGTH}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </FormField>

          <FormInput
            name="consultationFee"
            type="number"
            label="Consultation fee"
            value={form.consultationFee}
            onChange={(e) => updateField("consultationFee", e.target.value)}
            required
            min={0}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              name="availableFrom"
              type="time"
              label="Available from"
              value={form.availableFrom}
              onChange={(e) => updateField("availableFrom", e.target.value)}
              required
            />
            <FormInput
              name="availableTo"
              type="time"
              label="Available to"
              value={form.availableTo}
              onChange={(e) => updateField("availableTo", e.target.value)}
              required
            />
          </div>

          <FormField label="Available days" required>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => {
                const selected = form.availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      selected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-teal-200 bg-white text-teal-800 hover:bg-teal-50"
                    }`}
                  >
                    {formatWeekDay(day)}
                  </button>
                );
              })}
            </div>
          </FormField>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <FormButton type="submit" disabled={saving} fullWidth={false}>
              {saving ? "Saving…" : hasRecord ? "Update profile" : "Save profile"}
            </FormButton>
            {hasRecord && !mandatory && (
              <FormButton
                type="button"
                variant="secondary"
                fullWidth={false}
                disabled={saving}
                onClick={handleCancelEdit}
              >
                Cancel
              </FormButton>
            )}
          </div>
        </form>
      )}
    </>
  );

  if (loading) {
    if (mandatory) {
      return <p className="text-sm text-zinc-500">Loading doctor profile…</p>;
    }

    return (
      <ProfileSection title="Professional profile">
        <p className="text-sm text-zinc-500">Loading doctor profile…</p>
      </ProfileSection>
    );
  }

  if (mandatory) {
    return formContent;
  }

  return (
    <ProfileSection
      title={hasRecord ? "Professional profile" : "Complete professional profile"}
      description={
        editing || !hasRecord
          ? "Your license, specialization, and availability for patient bookings."
          : "Your saved professional information."
      }
      action={
        hasRecord && !editing && !loading ? (
          <ProfileEditButton onClick={() => setEditing(true)} />
        ) : null
      }
    >
      {formContent}
    </ProfileSection>
  );
}
