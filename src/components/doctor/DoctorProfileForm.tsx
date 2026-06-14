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
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import { extractApiEntity } from "@/helper/apiResponse";
import { apiGetCall, apiPatchCall, apiPostCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";

type DoctorData = {
  licenseNumber: string;
  qualification: string;
  specialization: string;
  yearsOfExperience: number;
  biography: string;
  consultationFee: number;
  availableFrom: string;
  availableTo: string;
  availableDays: string[];
};

type ApiBody<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

const weekDays = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

const emptyForm = {
  licenseNumber: "",
  qualification: "",
  specialization: "",
  yearsOfExperience: "",
  biography: "",
  consultationFee: "",
  availableFrom: "09:00",
  availableTo: "17:00",
  availableDays: [] as string[],
};

function toFormValues(data: DoctorData) {
  return {
    licenseNumber: data.licenseNumber ?? "",
    qualification: data.qualification ?? "",
    specialization: data.specialization ?? "",
    yearsOfExperience: String(data.yearsOfExperience ?? ""),
    biography: data.biography ?? "",
    consultationFee: String(data.consultationFee ?? ""),
    availableFrom: data.availableFrom ?? "09:00",
    availableTo: data.availableTo ?? "17:00",
    availableDays: data.availableDays ?? [],
  };
}

function toPayload(form: typeof emptyForm) {
  return {
    licenseNumber: form.licenseNumber.trim(),
    qualification: form.qualification.trim(),
    specialization: form.specialization.trim(),
    yearsOfExperience: Number(form.yearsOfExperience),
    biography: form.biography.trim(),
    consultationFee: Number(form.consultationFee),
    availableFrom: form.availableFrom.slice(0, 5),
    availableTo: form.availableTo.slice(0, 5),
    availableDays: form.availableDays,
  };
}

export default function DoctorProfileForm() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [snapshot, setSnapshot] = useState(emptyForm);
  const [hasRecord, setHasRecord] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const token = getAccessToken();
        const response = await apiGetCall({
          endpoint: "doctor_data",
          token: token ?? undefined,
        });

        if (response.status === 404) {
          setHasRecord(false);
          setEditing(true);
          return;
        }

        if (response.status !== API_CONSTANTS.success) {
          const errData = response.data as { message?: string };
          setError(errData?.message ?? "Failed to load doctor profile.");
          return;
        }

        const doctor = extractApiEntity<DoctorData>(response.data, "licenseNumber");
        if (doctor) {
          const values = toFormValues(doctor);
          setForm(values);
          setSnapshot(values);
          setHasRecord(true);
          setEditing(false);
        }
      } catch {
        setError("Cannot reach backend.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  function updateField(field: keyof typeof emptyForm, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDay(day: string) {
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

    setSaving(true);
    const payload = toPayload(form);
    const token = getAccessToken();
    try {
      const response = hasRecord
        ? await apiPatchCall({
            endpoint: "doctor_data",
            token: token ?? undefined,
            ...payload,
          })
        : await apiPostCall({
            endpoint: "doctor_data",
            token: token ?? undefined,
            ...payload,
          });

      const ok =
        response.status === API_CONSTANTS.success || response.status === 201;

      if (!ok) {
        const errData = response.data as { message?: string };
        setError(errData?.message ?? "Failed to save doctor profile.");
        return;
      }

      setHasRecord(true);
      setSnapshot(form);

      if (!hasRecord) {
        router.push("/doctor/dashboard");
        return;
      }

      setEditing(false);
      setMessage("Professional profile updated successfully.");
    } catch {
      setError("Cannot reach backend.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ProfileSection title="Professional profile">
        <p className="text-sm text-zinc-500">Loading doctor profile…</p>
      </ProfileSection>
    );
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
      {hasRecord && !editing ? (
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
                value: form.availableDays
                  .map((day) => day.charAt(0) + day.slice(1).toLowerCase())
                  .join(", "),
              },
              { label: "Biography", value: form.biography },
            ]}
          />
          {message && <ApiMessage message={message} variant="success" />}
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4">

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name="licenseNumber"
          label="License number"
          value={form.licenseNumber}
          onChange={(e) => updateField("licenseNumber", e.target.value)}
          required
        />
        <FormInput
          name="qualification"
          label="Qualification"
          value={form.qualification}
          onChange={(e) => updateField("qualification", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name="specialization"
          label="Specialization"
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

      <FormField label="Biography" htmlFor="biography" required>
        <textarea
          id="biography"
          name="biography"
          rows={4}
          value={form.biography}
          onChange={(e) => updateField("biography", e.target.value)}
          required
          minLength={10}
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
                {day.charAt(0) + day.slice(1).toLowerCase()}
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
        {hasRecord && (
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
    </ProfileSection>
  );
}
