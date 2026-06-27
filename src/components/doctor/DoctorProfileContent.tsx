'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/auth';
import { apiGetCall } from '@/helper/apiService';
import { isApiSuccess } from '@/helper/apiErrors';
import ProfileTabs from '@/components/profile/ProfileTabs';
import UserAccountForm from '@/components/profile/UserAccountForm';
import DoctorProfileForm from '@/components/doctor/DoctorProfileForm';
import ProfileAccountHeader from '@/components/profile/ProfileAccountHeader';
import { StoredUser } from '@/lib/auth';

interface DoctorProfileContentProps {
  doctorId: number;
}

export default function DoctorProfileContent({ doctorId }: DoctorProfileContentProps) {
  const [doctorData, setDoctorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const token = getAccessToken();
        const response = await apiGetCall({
          endpoint: 'view_profile',
          pathParams: { userId: doctorId },
          token,
        });

        if (isApiSuccess(response.status)) {
          setDoctorData(response.data.message);
        } else {
          setError('Failed to load doctor profile');
        }
      } catch (err) {
        console.error(err);
        setError('Error loading doctor profile');
      } finally {
        setLoading(false);
      }
    }

    if (doctorId) fetchDoctor();
  }, [doctorId]);

  if (loading) return <div className="p-6 text-slate-400">Loading doctor profile…</div>;
  if (error) return <div className="p-6 text-rose-500">{error}</div>;
  if (!doctorData) return null;

  const { firstName, lastName, email, mobileNumber, address, gender, dateOfBirth, profileImageURL } = doctorData;
  const doctor = doctorData.doctor;

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
      {/* Header with avatar, name, email, role */}
      <ProfileAccountHeader user={user} className="mb-2" />

      {/* Tabs – each tab shows the data in read-only mode (or edit mode for owner) */}
      <ProfileTabs
        defaultTab="account"
        tabs={[
          {
            id: 'account',
            label: 'Account',
            content: <UserAccountForm initialUser={user} />,
          },
          {
            id: 'professional',
            label: 'Professional profile',
            content: <DoctorProfileForm initialData={doctor} />,
          },
        ]}
      />
    </div>
  );
}