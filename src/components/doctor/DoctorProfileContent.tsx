"use client";

import { useMemo, useState } from "react";
import ProfileTabs from "@/components/profile/ProfileTabs";
import UserAccountForm from "@/components/profile/UserAccountForm";
import DoctorProfileForm from "@/components/doctor/DoctorProfileForm";

export default function DoctorProfileContent() {
  const tabs = useMemo(
    () => [
      {
        id: "account",
        label: "Account",
        content: <UserAccountForm key="doctor-account" />,
      },
      {
        id: "professional",
        label: "Professional profile",
        content: <DoctorProfileForm key="doctor-professional" />,
      },
    ],
    [],
  );

  return <ProfileTabs defaultTab="account" tabs={tabs} />;
}
