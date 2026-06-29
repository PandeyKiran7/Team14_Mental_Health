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
  fetchDoctorProfessionalDetailsById,
  getCachedDoctorProfessionalDetails,
  saveDoctorProfessionalDetails,
  type DoctorProfessionalFetchResult,
} from "@/lib/doctorProfessionalApi";
import { getAccessToken } from "@/lib/auth";
import {
  doctorDataToForm,
  emptyDoctorProfessionalForm,
  formatWeekDay,
  formToDoctorPayload,
  weekDays,
} from "@/lib/doctorForm";
import { getStoredUser } from "@/lib/auth";

const BIOGRAPHY_MAX_LENGTH = 1000;

type DoctorProfileFormProps = {
  mandatory?: boolean;
  onComplete?: () => void;
  /** Doctor table primary key — read-only load for other doctors via GET /doctor-data/:doctorId */
  doctorRecordId?: number;
  initialData?: Record<string, unknown>;
  isOwnProfile?: boolean;
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
  doctorRecordId,
  initialData,
  isOwnProfile: externalIsOwnProfile,
}: DoctorProfileFormProps = {}) {
  const router = useRouter();
  const [form, setForm] = useState(emptyDoctorProfessionalForm);
  const [snapshot, setSnapshot] = useState(emptyDoctorProfessionalForm);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [hasRecord, setHasRecord] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Determine if we are viewing our own profile
  const loggedInUser = getStoredUser();
  // If initialData is provided, get the userId from it; otherwise use logged-in user's ID for fetch.
  const isOwnProfile = typeof externalIsOwnProfile === "boolean"
    ? externalIsOwnProfile
    : initialData
    ? loggedInUser?.userId === initialData.userId
    : true; // If no initialData, we're viewing the logged-in user's own profile.

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const token = getAccessToken() ?? undefined;
        let result: DoctorProfessionalFetchResult;

        if (externalIsOwnProfile !== false) {
          result = await fetchDoctorProfessionalDetails(token);
        } else if (doctorRecordId) {
          result = await fetchDoctorProfessionalDetailsById(doctorRecordId, token);
        } else if (initialData) {
          const values = doctorDataToForm(initialData as Parameters<typeof doctorDataToForm>[0]);
          if (!cancelled) {
            setForm(values);
            setSnapshot(values);
            setAverageRating(readAverageRating(initialData));
            setHasRecord(true);
            setEditing(false);
            setLoading(false);
          }
          return;
        } else {
          result = { ok: true, data: null };
        }

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
  }, [doctorRecordId, initialData, externalIsOwnProfile]);

  async function refreshProfessionalDetails() {
    const token = getAccessToken() ?? undefined;
    const result =
      isOwnProfile
        ? await fetchDoctorProfessionalDetails(token)
        : doctorRecordId
          ? await fetchDoctorProfessionalDetailsById(doctorRecordId, token)
          : null;

    if (!result) return;

    if (!result.ok) {
      setError(result.message);
      return;
    }

    const next = applyFetchResult(result);
    setForm(next.form);
    setSnapshot(next.snapshot);
    setAverageRating(next.averageRating);
    setHasRecord(next.hasRecord);
    setError(next.error);
  }

  function updateField(
    field: keyof typeof emptyDoctorProfessionalForm,
    value: string | string[],
  ) {
    if (!isOwnProfile) return; // disallow editing if not own profile
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDay(day: (typeof weekDays)[number]) {
    if (!isOwnProfile) return;
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
    if (!isOwnProfile) {
      setError("You cannot edit another doctor's profile.");
      return;
    }
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

      if (isOwnProfile || doctorRecordId) {
        await refreshProfessionalDetails();
      }

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
              disabled={!isOwnProfile}
            />
            <FormInput
              name="qualification"
              label="Qualification"
              placeholder="MBBS, MD (Endocrinology)"
              value={form.qualification}
              onChange={(e) => updateField("qualification", e.target.value)}
              required
              disabled={!isOwnProfile}
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
              disabled={!isOwnProfile}
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
              disabled={!isOwnProfile}
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
              disabled={!isOwnProfile}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-zinc-100"
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
            disabled={!isOwnProfile}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              name="availableFrom"
              type="time"
              label="Available from"
              value={form.availableFrom}
              onChange={(e) => updateField("availableFrom", e.target.value)}
              required
              disabled={!isOwnProfile}
            />
            <FormInput
              name="availableTo"
              type="time"
              label="Available to"
              value={form.availableTo}
              onChange={(e) => updateField("availableTo", e.target.value)}
              required
              disabled={!isOwnProfile}
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
                    disabled={!isOwnProfile}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      selected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-teal-200 bg-white text-teal-800 hover:bg-teal-50"
                    } ${!isOwnProfile ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {formatWeekDay(day)}
                  </button>
                );
              })}
            </div>
          </FormField>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {isOwnProfile && (
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
          )}
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

  // Determine if we should show the Edit button (only if own profile and not already editing)
  const showEditButton = isOwnProfile && hasRecord && !editing && !loading;

  return (
    <ProfileSection
      title={hasRecord ? "Professional profile" : "Complete professional profile"}
      description={
        editing || !hasRecord
          ? "Your license, specialization, and availability for patient bookings."
          : isOwnProfile
          ? "Your saved professional information."
          : "Doctor's professional information."
      }
      action={
        showEditButton ? (
          <ProfileEditButton
            onClick={() => {
              void refreshProfessionalDetails().then(() => setEditing(true));
            }}
          />
        ) : null
      }
    >
      {formContent}
    </ProfileSection>
  );
}