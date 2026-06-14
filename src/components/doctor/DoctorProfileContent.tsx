"use client";

import ProfileTabs from "@/components/profile/ProfileTabs";
import UserAccountForm from "@/components/profile/UserAccountForm";
import DoctorProfileForm from "@/components/doctor/DoctorProfileForm";

export default function DoctorProfileContent() {
  return (
    <ProfileTabs
      tabs={[
        {
          id: "account",
          label: "Account",
          content: <UserAccountForm />,
        },
        {
          id: "professional",
          label: "Professional profile",
          content: <DoctorProfileForm />,
        },
      ]}
    />
  );
}
