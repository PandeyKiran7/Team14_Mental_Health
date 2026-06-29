'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAccessToken, getStoredUser, setStoredUser } from '@/lib/auth';
import ProfileTabs from '@/components/profile/ProfileTabs';
import UserAccountForm from '@/components/profile/UserAccountForm';
import DoctorProfileForm from '@/components/doctor/DoctorProfileForm';
import ProfileAccountHeader from '@/components/profile/ProfileAccountHeader';
import { StoredUser } from '@/lib/auth';
import {
  fetchDoctorViewProfile,
  type DoctorViewProfile,
} from '@/lib/profileImageApi';

interface DoctorProfileContentProps {
  doctorId: number;
}

export default function DoctorProfileContent({ doctorId }: DoctorProfileContentProps) {
  const [doctorData, setDoctorData] = useState<DoctorViewProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setError(null);

    const result = await fetchDoctorViewProfile(
      doctorId,
      getAccessToken() ?? undefined,
    );

    if (!result.ok) {
      setError(result.message);
      setDoctorData(null);
      return;
    }

    setDoctorData(result.data);
  }, [doctorId]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      await loadProfile();
      if (!cancelled) {
        setLoading(false);
      }
    }

    if (doctorId) {
      void run();
    }

    const handleAuthChange = () => {
      void loadProfile();
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      cancelled = true;
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [doctorId, loadProfile]);

  async function handleProfileImageUpdated(profileImageURL?: string) {
    await loadProfile();

    const loggedInUser = getStoredUser();
    if (loggedInUser?.userId === doctorId) {
      setStoredUser({ ...loggedInUser, profileImageURL });
    }
  }

  if (loading) return <div className="p-6 text-slate-400">Loading doctor profile…</div>;
  if (error) return <div className="p-6 text-rose-500">{error}</div>;
  if (!doctorData) return null;

  const {
    firstName,
    lastName,
    email,
    mobileNumber,
    address,
    gender,
    profileImageURL,
  } = doctorData;
  const doctor = doctorData.doctor;
  const doctorRecordId =
    doctor && typeof doctor.id === "number" ? doctor.id : undefined;

  const loggedInUser = getStoredUser();
  const isOwnProfile = loggedInUser?.userId === doctorData.userId;

  const user: StoredUser = {
    userId: doctorData.userId,
    firstName,
    lastName,
    email,
    mobileNumber,
    address,
    gender,
    role: 'DOCTOR',
    profileImageURL,
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <ProfileAccountHeader
        user={user}
        className="mb-2"
        allowImageUpload={isOwnProfile}
        onProfileImageUpdated={(url) => void handleProfileImageUpdated(url)}
      />

      <ProfileTabs
        defaultTab="account"
        tabs={[
          {
            id: 'account',
            label: 'Account',
            content: <UserAccountForm initialUser={user} hideHeader />,
          },
          {
            id: 'professional',
            label: 'Professional profile',
            content: (
              <DoctorProfileForm
                initialData={isOwnProfile ? undefined : (doctorData.doctor as Record<string, unknown>)}
                isOwnProfile={isOwnProfile}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
