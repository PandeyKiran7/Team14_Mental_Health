'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DoctorProfileContent from '@/components/doctor/DoctorProfileContent';

export default function DoctorProfilePage() {
  console.log('🔵 DoctorProfilePage rendered'); // ✅ यो console मा आउँछ?

  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');
  console.log('🔵 doctorId from URL:', doctorId);

  if (!doctorId) {
    return <div className="p-6 text-red-500">Missing doctor ID.</div>;
  }

  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading doctor profile…</div>}>
      <DoctorProfileContent doctorId={Number(doctorId)} />
    </Suspense>
  );
}