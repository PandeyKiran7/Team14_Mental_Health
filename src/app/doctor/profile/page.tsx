'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';
import DoctorProfileContent from '@/components/doctor/DoctorProfileContent';

export default function DoctorProfilePage() {

  const searchParams = useSearchParams();
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const doctorIdFromUrl = searchParams.get('doctorId');

  useEffect(() => {
    if (doctorIdFromUrl) {
      setDoctorId(Number(doctorIdFromUrl));
      setCheckingAuth(false);
    } else {
      const user = getStoredUser();
      if (user && user.userId) {
        setDoctorId(user.userId);
      }
      setCheckingAuth(false);
    }
  }, [doctorIdFromUrl]);

  if (checkingAuth) {
    return <div className="p-6 text-slate-400">Verifying session…</div>;
  }

  if (!doctorId) {
    return <div className="p-6 text-red-500">Missing doctor ID.</div>;
  }

  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading doctor profile…</div>}>
      <DoctorProfileContent doctorId={doctorId} />
    </Suspense>
  );
}