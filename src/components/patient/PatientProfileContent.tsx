"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProfileTabs from "@/components/profile/ProfileTabs";
import UserAccountForm from "@/components/profile/UserAccountForm";
import PatientMedicalDataForm from "@/components/patient/PatientMedicalDataForm";
import ProfileAccountHeader from "@/components/profile/ProfileAccountHeader";
import { getStoredUser, setStoredUser, type StoredUser } from "@/lib/auth";

export default function PatientProfileContent() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());

    const handleAuthChange = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  const handleProfileImageUpdated = useCallback((profileImageURL?: string) => {
    const stored = getStoredUser();
    if (!stored) return;

    const updated = { ...stored, profileImageURL };
    setStoredUser(updated);
    setUser(updated);
  }, []);

  const tabs = useMemo(
    () => [
      {
        id: "account",
        label: "Account",
        content: <UserAccountForm key="patient-account" initialUser={user ?? undefined} hideHeader />,
      },
      {
        id: "medical",
        label: "Medical profile",
        content: <PatientMedicalDataForm key="patient-medical" />,
      },
    ],
    [user],
  );

  if (!user) {
    return <div className="p-6 text-slate-400">Loading patient profile…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <ProfileAccountHeader
        user={user}
        className="mb-2"
        allowImageUpload
        onProfileImageUpdated={(url) => handleProfileImageUpdated(url)}
      />

      <ProfileTabs tabs={tabs} />
    </div>
  );
}
