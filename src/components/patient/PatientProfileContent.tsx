"use client";

import { useMemo } from "react";
import ProfileTabs from "@/components/profile/ProfileTabs";
import UserAccountForm from "@/components/profile/UserAccountForm";
import PatientMedicalDataForm from "@/components/patient/PatientMedicalDataForm";

export default function PatientProfileContent() {
  const tabs = useMemo(
    () => [
      {
        id: "account",
        label: "Account",
        content: <UserAccountForm key="patient-account" />,
      },
      {
        id: "medical",
        label: "Medical profile",
        content: <PatientMedicalDataForm key="patient-medical" />,
      },
    ],
    [],
  );

  return <ProfileTabs tabs={tabs} />;
}
