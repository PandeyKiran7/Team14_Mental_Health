// src/components/patient/DoctorCard.tsx
'use client';

import Image from 'next/image';
import { resolveProfileImageUrl } from '@/lib/profileImageApi';

interface Doctor {
  userId: number;
  firstName: string;
  lastName: string;
  profileImageURL: string;
  email?: string;
  mobileNumber?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment: (id: number) => void;   // ← parent सँग मिलाइयो
  onViewProfile: (id: number) => void;
}

export default function DoctorCard({ doctor, onBookAppointment, onViewProfile }: DoctorCardProps) {
  const formattedDOB = doctor.dateOfBirth
    ? new Date(doctor.dateOfBirth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

  const imageSrc = resolveProfileImageUrl(doctor.profileImageURL);

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      <div className="flex items-center gap-4">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`${doctor.firstName} ${doctor.lastName}`}
            width={64}
            height={64}
            className="rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-lg font-semibold text-white">
            {doctor.firstName?.[0]}
            {doctor.lastName?.[0]}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-lg">
            Dr. {doctor.firstName} {doctor.lastName}
          </h3>
          <p className="text-sm text-gray-500">{doctor.gender || 'Gender not specified'}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium">EMAIL</span>
          <p className="truncate">{doctor.email || 'N/A'}</p>
        </div>
        <div>
          <span className="font-medium">MOBILE</span>
          <p>{doctor.mobileNumber || 'N/A'}</p>
        </div>
        <div className="col-span-2">
          <span className="font-medium">ADDRESS</span>
          <p>{doctor.address || 'N/A'}</p>
        </div>
        <div className="col-span-2">
          <span className="font-medium">DATE OF BIRTH</span>
          <p>{formattedDOB}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onViewProfile(doctor.userId)}
          className="flex-1 bg-green-100 text-green-800 py-2 rounded hover:bg-green-200"
        >
          View Profile
        </button>
        <button
          onClick={() => onBookAppointment(doctor.userId)}
          className="flex-1 bg-green-700 text-white py-2 rounded hover:bg-green-800"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}