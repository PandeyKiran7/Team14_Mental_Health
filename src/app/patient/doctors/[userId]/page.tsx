'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import DoctorProfileContent from '@/components/doctor/DoctorProfileContent';

export default function DoctorProfilePage() {
  const { userId } = useParams<{ userId: string }>();

  if (!userId) {
    return <div className="p-6 text-red-500">Doctor ID is required.</div>;
  }

  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading doctor profile…</div>}>
      <DoctorProfileContent doctorId={Number(userId)} />
    </Suspense>
  );
}