// app/doctor/patient-details/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiGetCall } from '@/helper/apiService';
import { Loader2 } from 'lucide-react';
import { useBookingReview } from '@/hooks/useBookingReview';
import BookingReviewDialogs from '@/components/booking/BookingReviewDialogs';

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function PatientDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.id;
  const bookingId = searchParams.get('bookingId');

  const [medicalData, setMedicalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const review = useBookingReview(async () => {
    router.push('/doctor/bookings');
  });

  useEffect(() => {
    if (!userId) {
      setError('No patient ID provided');
      setLoading(false);
      return;
    }

    const fetchMedicalData = async () => {
      try {
        const response = await apiGetCall({
          endpoint: 'user_medical_data',
          pathParams: { userId }
        });

        if (response.status === 200 && response.data?.success) {
          setMedicalData(response.data.message);
        } else {
          setError(response.data?.data || 'Failed to load medical data');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalData();
  }, [userId]);

  // --- Action Handlers ---
  const handleApprove = () => {
    if (!bookingId) {
      alert('No booking ID found to approve.');
      return;
    }
    review.requestApprove(Number(bookingId));
  };

  const handleDeny = () => {
    if (!bookingId) {
      alert('No booking ID found to deny.');
      return;
    }
    review.requestDeny(Number(bookingId));
  };

  // --- Loading / Error States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-rose-500 text-center">
        <p>{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-teal-700 underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!medicalData) {
    return <p className="p-6 text-slate-500">No medical data found for this patient.</p>;
  }

  const { firstName, middleName, lastName, gender, dateOfBirth, mobileNumber, address, patient } = medicalData;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-teal-900">Patient Medical Details</h1>
          <button
            onClick={() => router.back()}
            className="text-sm text-teal-700 hover:underline"
          >
            ← Back
          </button>
        </div>

        {/* Personal Information */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Full Name</p>
              <p className="font-medium text-slate-800">
                {firstName} {middleName || ''} {lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Gender</p>
              <p className="font-medium text-slate-800">{gender}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Date of Birth</p>
              <p className="font-medium text-slate-800">{dateOfBirth ? formatDate(dateOfBirth) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Mobile</p>
              <p className="font-medium text-slate-800">{mobileNumber || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Address</p>
              <p className="font-medium text-slate-800">{address || '—'}</p>
            </div>
          </div>
        </section>

        {/* Medical History */}
        {patient && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Medical History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Blood Group</p>
                <p className="font-medium text-slate-800">{patient.bloodGroup || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Height / Weight</p>
                <p className="font-medium text-slate-800">
                  {patient.heightCM} cm / {patient.weightKG} kg
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Diabetes Type</p>
                <p className="font-medium text-slate-800">{patient.diabetesType || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Diagnosis Date</p>
                <p className="font-medium text-slate-800">
                  {patient.diagnosisDate ? formatDate(patient.diagnosisDate) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Current Medication</p>
                <p className="font-medium text-slate-800">{patient.currentMedication || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Activity Level</p>
                <p className="font-medium text-slate-800">{patient.activityLevel || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Dietary Preference</p>
                <p className="font-medium text-slate-800">{patient.dietaryPreference || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-400">Symptoms</p>
                <p className="font-medium text-slate-800">{patient.symptoms || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-400">Short Description</p>
                <p className="font-medium text-slate-800">{patient.shortDescription || '—'}</p>
              </div>
            </div>
          </section>
        )}

        {/* --- Action Buttons --- */}
        {bookingId && (
          <div className="flex justify-end space-x-4 border-t pt-6">
            <button
              onClick={handleDeny}
              disabled={review.actionId !== null}
              className="px-6 py-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {review.actionId === Number(bookingId) && review.denyTargetId !== null ? (
                <Loader2 className="inline animate-spin mr-2 size-4" />
              ) : null}
              Deny
            </button>
            <button
              onClick={handleApprove}
              disabled={review.actionId !== null}
              className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {review.actionId === Number(bookingId) && review.approveTargetId !== null ? (
                <Loader2 className="inline animate-spin mr-2 size-4" />
              ) : null}
              Approve
            </button>
          </div>
        )}

        <BookingReviewDialogs
          {...review}
          getTarget={() => undefined}
          onConfirmApprove={() => void review.confirmApprove()}
          onConfirmDeny={() => void review.confirmDeny()}
          onCancelApprove={review.cancelApprove}
          onCancelDeny={review.cancelDeny}
        />
      </div>
    </div>
  );
}