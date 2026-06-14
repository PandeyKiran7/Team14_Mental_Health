"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormButton from "@/components/formElements/FormButton";
import FormInput from "@/components/formElements/FormInput";
import FormSelect from "@/components/formElements/FormSelect";
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

type PatientMedicalData = {
  diabetesType: string;
  diagnosisDate: string;
  previousDiagnosis?: string;
  heightCM: number;
  weightKG: number;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  currentMedication?: string;
  targetGlucoseMin: number;
  targetGlucoseMax: number;
  activityLevel: string;
  dietaryPreference: string;
  symptoms?: string;
  shortDescription?: string;
};

const bloodGroupOptions = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
].map((v) => ({ value: v, label: v }));

const activityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MODERATE", label: "Moderate" },
  { value: "HIGH", label: "High" },
];

const dietOptions = [
  { value: "VEG", label: "Vegetarian" },
  { value: "NON_VEG", label: "Non-vegetarian" },
  { value: "VEGAN", label: "Vegan" },
  { value: "KETO", label: "Keto" },
  { value: "OTHER", label: "Other" },
];

const emptyForm = {
  diabetesType: "",
  diagnosisDate: "",
  previousDiagnosis: "",
  heightCM: "",
  weightKG: "",
  bloodGroup: "O+",
  emergencyContactName: "",
  emergencyContactPhone: "",
  currentMedication: "",
  targetGlucoseMin: "",
  targetGlucoseMax: "",
  activityLevel: "MODERATE",
  dietaryPreference: "VEG",
  symptoms: "",
  shortDescription: "",
};

function toFormValues(data: PatientMedicalData) {
  const diagnosisDate =
    typeof data.diagnosisDate === "string"
      ? data.diagnosisDate.slice(0, 10)
      : "";

  return {
    diabetesType: data.diabetesType ?? "",
    diagnosisDate,
    previousDiagnosis: data.previousDiagnosis ?? "",
    heightCM: String(data.heightCM ?? ""),
    weightKG: String(data.weightKG ?? ""),
    bloodGroup: data.bloodGroup ?? "O+",
    emergencyContactName: data.emergencyContactName ?? "",
    emergencyContactPhone: data.emergencyContactPhone ?? "",
    currentMedication: data.currentMedication ?? "",
    targetGlucoseMin: String(data.targetGlucoseMin ?? ""),
    targetGlucoseMax: String(data.targetGlucoseMax ?? ""),
    activityLevel: data.activityLevel ?? "MODERATE",
    dietaryPreference: data.dietaryPreference ?? "VEG",
    symptoms: data.symptoms ?? "",
    shortDescription: data.shortDescription ?? "",
  };
}

function toPayload(form: typeof emptyForm) {
  return {
    diabetesType: form.diabetesType.trim(),
    diagnosisDate: form.diagnosisDate,
    previousDiagnosis: form.previousDiagnosis.trim() || undefined,
    heightCM: Number(form.heightCM),
    weightKG: Number(form.weightKG),
    bloodGroup: form.bloodGroup,
    emergencyContactName: form.emergencyContactName.trim(),
    emergencyContactPhone: form.emergencyContactPhone.trim(),
    currentMedication: form.currentMedication.trim() || undefined,
    targetGlucoseMin: Number(form.targetGlucoseMin),
    targetGlucoseMax: Number(form.targetGlucoseMax),
    activityLevel: form.activityLevel,
    dietaryPreference: form.dietaryPreference,
    symptoms: form.symptoms.trim() || undefined,
    shortDescription: form.shortDescription.trim() || undefined,
  };
}

function optionLabel(
  options: { value: string; label: string }[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export default function PatientMedicalDataForm() {
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
          endpoint: "patient_medical_data",
          token: token ?? undefined,
        });

        if (response.status !== API_CONSTANTS.success) {
          setError(
            getApiErrorMessage(response.data, "Failed to load medical data."),
          );
          return;
        }

        const patient = extractApiEntity<PatientMedicalData>(
          response.data,
          "diabetesType",
        );

        if (patient) {
          const values = toFormValues(patient);
          setForm(values);
          setSnapshot(values);
          setHasRecord(true);
          setEditing(false);
        } else {
          setHasRecord(false);
          setEditing(true);
        }
      } catch {
        setError("Cannot reach backend.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCancelEdit() {
    setForm(snapshot);
    setEditing(false);
    setError(null);
    setMessage(null);
  }

  async function saveMedicalData(payload: ReturnType<typeof toPayload>, create: boolean) {
    const token = getAccessToken();

    if (create) {
      return apiPostCall({
        endpoint: "patient_create",
        token: token ?? undefined,
        ...payload,
      });
    }

    return apiPatchCall({
      endpoint: "update_patient_medical_data",
      token: token ?? undefined,
      ...payload,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    const payload = toPayload(form);

    if (Number(payload.targetGlucoseMax) <= Number(payload.targetGlucoseMin)) {
      setError("Target glucose max must be greater than min.");
      setSaving(false);
      return;
    }

    try {
      let response = await saveMedicalData(payload, !hasRecord);

      if (
        response.status === 404 &&
        getApiErrorMessage(response.data).toLowerCase().includes("patient not found")
      ) {
        response = await saveMedicalData(payload, true);
      }

      const ok =
        response.status === API_CONSTANTS.success || response.status === 201;

      if (!ok) {
        setError(getApiErrorMessage(response.data, "Failed to save medical data."));
        return;
      }

      setHasRecord(true);
      setSnapshot(form);

      if (!hasRecord) {
        router.push("/patient/dashboard");
        return;
      }

      setEditing(false);
      setMessage("Medical profile updated successfully.");
    } catch {
      setError("Cannot reach backend.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ProfileSection title="Medical profile">
        <p className="text-sm text-zinc-500">Loading medical profile…</p>
      </ProfileSection>
    );
  }

  return (
    <ProfileSection
      title={hasRecord ? "Medical profile" : "Complete medical profile"}
      description={
        editing || !hasRecord
          ? "Your diabetes and health information used for care and appointments."
          : "Your saved medical information."
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
              { label: "Diabetes type", value: form.diabetesType },
              { label: "Diagnosis date", value: form.diagnosisDate },
              { label: "Previous diagnosis", value: form.previousDiagnosis },
              { label: "Blood group", value: form.bloodGroup },
              { label: "Height (cm)", value: form.heightCM },
              { label: "Weight (kg)", value: form.weightKG },
              {
                label: "Target glucose",
                value: `${form.targetGlucoseMin} – ${form.targetGlucoseMax}`,
              },
              { label: "Activity level", value: optionLabel(activityOptions, form.activityLevel) },
              {
                label: "Dietary preference",
                value: optionLabel(dietOptions, form.dietaryPreference),
              },
              { label: "Emergency contact", value: form.emergencyContactName },
              { label: "Emergency phone", value: form.emergencyContactPhone },
              { label: "Current medication", value: form.currentMedication },
              { label: "Symptoms", value: form.symptoms },
              { label: "Short description", value: form.shortDescription },
            ]}
          />
          {message && <ApiMessage message={message} variant="success" />}
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4">

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name="diabetesType"
          label="Diabetes type"
          placeholder="Type 1, Type 2, etc."
          value={form.diabetesType}
          onChange={(e) => updateField("diabetesType", e.target.value)}
          required
        />
        <FormInput
          name="diagnosisDate"
          type="date"
          label="Diagnosis date"
          value={form.diagnosisDate}
          onChange={(e) => updateField("diagnosisDate", e.target.value)}
          required
        />
      </div>

      <FormInput
        name="previousDiagnosis"
        label="Previous diagnosis"
        value={form.previousDiagnosis}
        onChange={(e) => updateField("previousDiagnosis", e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <FormInput
          name="heightCM"
          type="number"
          label="Height (cm)"
          value={form.heightCM}
          onChange={(e) => updateField("heightCM", e.target.value)}
          required
          min={30}
          max={300}
        />
        <FormInput
          name="weightKG"
          type="number"
          label="Weight (kg)"
          value={form.weightKG}
          onChange={(e) => updateField("weightKG", e.target.value)}
          required
          min={2}
          max={500}
        />
        <FormSelect
          name="bloodGroup"
          label="Blood group"
          value={form.bloodGroup}
          onChange={(e) => updateField("bloodGroup", e.target.value)}
          options={bloodGroupOptions}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name="emergencyContactName"
          label="Emergency contact name"
          value={form.emergencyContactName}
          onChange={(e) => updateField("emergencyContactName", e.target.value)}
          required
        />
        <FormInput
          name="emergencyContactPhone"
          type="tel"
          label="Emergency contact phone"
          value={form.emergencyContactPhone}
          onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
          required
          pattern="[0-9]{7,15}"
        />
      </div>

      <FormInput
        name="currentMedication"
        label="Current medication"
        value={form.currentMedication}
        onChange={(e) => updateField("currentMedication", e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name="targetGlucoseMin"
          type="number"
          label="Target glucose min"
          value={form.targetGlucoseMin}
          onChange={(e) => updateField("targetGlucoseMin", e.target.value)}
          required
          min={0}
        />
        <FormInput
          name="targetGlucoseMax"
          type="number"
          label="Target glucose max"
          value={form.targetGlucoseMax}
          onChange={(e) => updateField("targetGlucoseMax", e.target.value)}
          required
          min={0}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          name="activityLevel"
          label="Activity level"
          value={form.activityLevel}
          onChange={(e) => updateField("activityLevel", e.target.value)}
          options={activityOptions}
          required
        />
        <FormSelect
          name="dietaryPreference"
          label="Dietary preference"
          value={form.dietaryPreference}
          onChange={(e) => updateField("dietaryPreference", e.target.value)}
          options={dietOptions}
          required
        />
      </div>

      <FormField label="Symptoms" htmlFor="symptoms">
        <textarea
          id="symptoms"
          name="symptoms"
          rows={3}
          value={form.symptoms}
          onChange={(e) => updateField("symptoms", e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
      </FormField>

      <FormField label="Short description" htmlFor="shortDescription">
        <textarea
          id="shortDescription"
          name="shortDescription"
          rows={3}
          value={form.shortDescription}
          onChange={(e) => updateField("shortDescription", e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
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
