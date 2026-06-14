"use client";

import ProfileTabs from "@/components/profile/ProfileTabs";
import UserAccountForm from "@/components/profile/UserAccountForm";
import PatientMedicalDataForm from "@/components/patient/PatientMedicalDataForm";

export default function PatientProfileContent() {
  return (
    <ProfileTabs
      tabs={[
        {
          id: "account",
          label: "Account",
          content: <UserAccountForm />,
        },
        {
          id: "medical",
          label: "Medical profile",
          content: <PatientMedicalDataForm />,
        },
      ]}
    />
  );
}
