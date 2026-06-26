"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import FormInput from "@/components/formElements/FormInput";
import FormSelect from "@/components/formElements/FormSelect";
import { API_CONSTANTS } from "@/constants/staticConstant";
import {
  getNetworkErrorMessage,
  isApiSuccess,
  resolveAdminMutationError,
  resolveApiError,
} from "@/helper/apiErrors";
import { apiGetCall, apiPatchCall, apiPostCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import ApiMessage from "@/components/ui/ApiMessage";
import {
  normalizeUserDetail,
  normalizeUserWithMedicalData,
  type AdminUser,
} from "@/types/admin";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

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

const emptyMedical = {
  diabetesType: "",
  diagnosisDate: "",
  heightCM: "",
  weightKG: "",
  bloodGroup: "O+",
  emergencyContactName: "",
  emergencyContactPhone: "",
  targetGlucoseMin: "",
  targetGlucoseMax: "",
  activityLevel: "MODERATE",
  dietaryPreference: "VEG",
};

type AdminPatientEditModalProps = {
  patient: AdminUser | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function AdminPatientEditModal({
  patient,
  onClose,
  onUpdated,
}: AdminPatientEditModalProps) {
  const [account, setAccount] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    address: "",
    gender: "MALE",
  });
  const [medical, setMedical] = useState(emptyMedical);
  const [hasMedical, setHasMedical] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patient) return;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const token = getAccessToken() ?? undefined;
        const [userRes, medicalRes] = await Promise.all([
          apiGetCall({
            endpoint: "user_by_id",
            pathParams: { userId: patient!.userId },
            token,
          }),
          apiGetCall({
            endpoint: "user_medical_data",
            pathParams: { userId: patient!.userId },
            token,
          }),
        ]);

        if (isApiSuccess(userRes.status)) {
          const detail = normalizeUserDetail(userRes.data);
          if (detail) {
            setAccount({
              firstName: detail.firstName ?? "",
              lastName: detail.lastName ?? "",
              mobileNumber: detail.mobileNumber ?? "",
              address: detail.address ?? "",
              gender: detail.gender ?? "MALE",
            });
          }
        } else {
          setAccount({
            firstName: patient!.firstName,
            lastName: patient!.lastName,
            mobileNumber: patient!.mobileNumber ?? "",
            address: patient!.address ?? "",
            gender: patient!.gender ?? "MALE",
          });
        }

        if (medicalRes.status === API_CONSTANTS.success) {
          const record = normalizeUserWithMedicalData(medicalRes.data)?.patient;
          if (record) {
            setHasMedical(true);
            setMedical({
              diabetesType: record.diabetesType ?? "",
              diagnosisDate: record.diagnosisDate?.slice(0, 10) ?? "",
              heightCM: String(record.heightCM ?? ""),
              weightKG: String(record.weightKG ?? ""),
              bloodGroup: record.bloodGroup ?? "O+",
              emergencyContactName: record.emergencyContactName ?? "",
              emergencyContactPhone: record.emergencyContactPhone ?? "",
              targetGlucoseMin: String(record.targetGlucoseMin ?? ""),
              targetGlucoseMax: String(record.targetGlucoseMax ?? ""),
              activityLevel: record.activityLevel ?? "MODERATE",
              dietaryPreference: record.dietaryPreference ?? "VEG",
            });
          } else {
            setHasMedical(false);
            setMedical(emptyMedical);
          }
        } else {
          setHasMedical(false);
          setMedical(emptyMedical);
        }
      } catch {
        setError("Cannot load patient details.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [patient]);

  if (!patient) return null;

  function updateAccount(field: keyof typeof account, value: string) {
    setAccount((prev) => ({ ...prev, [field]: value }));
  }

  function updateMedical(field: keyof typeof emptyMedical, value: string) {
    setMedical((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!account.firstName.trim() || !account.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    if (!/^[0-9]{7,15}$/.test(account.mobileNumber.trim())) {
      setError("Mobile number must be 10 digits.");
      return;
    }

    const medicalPayload = {
      diabetesType: medical.diabetesType.trim(),
      diagnosisDate: medical.diagnosisDate,
      heightCM: Number(medical.heightCM),
      weightKG: Number(medical.weightKG),
      bloodGroup: medical.bloodGroup,
      emergencyContactName: medical.emergencyContactName.trim(),
      emergencyContactPhone: medical.emergencyContactPhone.trim(),
      targetGlucoseMin: Number(medical.targetGlucoseMin),
      targetGlucoseMax: Number(medical.targetGlucoseMax),
      activityLevel: medical.activityLevel,
      dietaryPreference: medical.dietaryPreference,
      userId: patient?.userId ?? "",
    };

    const hasMedicalInput =
      medical.diabetesType.trim() &&
      medical.diagnosisDate &&
      medical.heightCM &&
      medical.weightKG;

    if (hasMedicalInput) {
      if (Number(medicalPayload.targetGlucoseMax) <= Number(medicalPayload.targetGlucoseMin)) {
        setError("Target glucose max must be greater than min.");
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const token = getAccessToken() ?? undefined;

      const accountRes = await apiPatchCall({
        endpoint: "update_user",
        userId: patient?.userId ?? "",
        firstName: account.firstName.trim(),
        lastName: account.lastName.trim(),
        mobileNumber: account.mobileNumber.trim(),
        address: account.address.trim() || undefined,
        gender: account.gender,
        token,
      });

      if (!isApiSuccess(accountRes.status)) {
        setError(resolveApiError(accountRes, "Failed to update account."));
        return;
      }

      if (hasMedicalInput) {
        const medicalRes = hasMedical
          ? await apiPatchCall({
              endpoint: "update_patient_medical_data",
              ...medicalPayload,
              token,
            })
          : await apiPostCall({
              endpoint: "patient_create",
              ...medicalPayload,
              token,
            });

        const medicalOk =
          isApiSuccess(medicalRes.status) || medicalRes.status === 201;

        if (!medicalOk) {
          setError(
            resolveAdminMutationError(medicalRes, "Account saved but medical data failed."),
          );
          return;
        }
      }

      onUpdated();
      onClose();
    } catch (saveError) {
      setError(getNetworkErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-zinc-900/50"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto scrollbar-hide rounded-xl border border-teal-100 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-teal-800">Edit patient</h2>
            <p className="mt-1 text-sm text-zinc-500">{patient.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-teal-50"
          >
            <XIcon size={20} />
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-zinc-500">Loading…</p>
        ) : (
          <div className="mt-6 space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-teal-800">Account</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <FormInput
                  name="firstName"
                  label="First name"
                  value={account.firstName}
                  onChange={(e) => updateAccount("firstName", e.target.value)}
                  required
                />
                <FormInput
                  name="lastName"
                  label="Last name"
                  value={account.lastName}
                  onChange={(e) => updateAccount("lastName", e.target.value)}
                  required
                />
                <FormInput
                  name="mobileNumber"
                  label="Mobile"
                  value={account.mobileNumber}
                  onChange={(e) => updateAccount("mobileNumber", e.target.value)}
                  required
                />
                <FormSelect
                  name="gender"
                  label="Gender"
                  value={account.gender}
                  onChange={(e) => updateAccount("gender", e.target.value)}
                  options={GENDER_OPTIONS}
                  required
                />
                <FormInput
                  name="address"
                  label="Address"
                  fieldClassName="sm:col-span-2"
                  value={account.address}
                  onChange={(e) => updateAccount("address", e.target.value)}
                />
              </div>
            </section>

            <section className="border-t border-teal-100 pt-6">
              <h3 className="text-sm font-semibold text-teal-800">Medical profile</h3>
              <p className="mt-1 text-xs text-zinc-500">
                {hasMedical
                  ? "Update diabetes and health information."
                  : "Optional — add medical details if not yet completed by the patient."}
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <FormInput
                  name="diabetesType"
                  label="Diabetes type"
                  value={medical.diabetesType}
                  onChange={(e) => updateMedical("diabetesType", e.target.value)}
                />
                <FormInput
                  name="diagnosisDate"
                  type="date"
                  label="Diagnosis date"
                  value={medical.diagnosisDate}
                  onChange={(e) => updateMedical("diagnosisDate", e.target.value)}
                />
                <FormInput
                  name="heightCM"
                  type="number"
                  label="Height (cm)"
                  value={medical.heightCM}
                  onChange={(e) => updateMedical("heightCM", e.target.value)}
                />
                <FormInput
                  name="weightKG"
                  type="number"
                  label="Weight (kg)"
                  value={medical.weightKG}
                  onChange={(e) => updateMedical("weightKG", e.target.value)}
                />
                <FormSelect
                  name="bloodGroup"
                  label="Blood group"
                  value={medical.bloodGroup}
                  onChange={(e) => updateMedical("bloodGroup", e.target.value)}
                  options={bloodGroupOptions}
                />
                <FormInput
                  name="emergencyContactName"
                  label="Emergency contact"
                  value={medical.emergencyContactName}
                  onChange={(e) => updateMedical("emergencyContactName", e.target.value)}
                />
                <FormInput
                  name="emergencyContactPhone"
                  label="Emergency phone"
                  value={medical.emergencyContactPhone}
                  onChange={(e) => updateMedical("emergencyContactPhone", e.target.value)}
                />
                <FormInput
                  name="targetGlucoseMin"
                  type="number"
                  label="Target glucose min"
                  value={medical.targetGlucoseMin}
                  onChange={(e) => updateMedical("targetGlucoseMin", e.target.value)}
                />
                <FormInput
                  name="targetGlucoseMax"
                  type="number"
                  label="Target glucose max"
                  value={medical.targetGlucoseMax}
                  onChange={(e) => updateMedical("targetGlucoseMax", e.target.value)}
                />
                <FormSelect
                  name="activityLevel"
                  label="Activity level"
                  value={medical.activityLevel}
                  onChange={(e) => updateMedical("activityLevel", e.target.value)}
                  options={activityOptions}
                />
                <FormSelect
                  name="dietaryPreference"
                  label="Dietary preference"
                  value={medical.dietaryPreference}
                  onChange={(e) => updateMedical("dietaryPreference", e.target.value)}
                  options={dietOptions}
                />
              </div>
            </section>
          </div>
        )}

        {error && <ApiMessage message={error} className="mt-4" />}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || loading}
            onClick={() => void handleSave()}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
