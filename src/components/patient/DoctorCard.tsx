'use client';

import router from "next/dist/shared/lib/router/router";

interface Doctor {
  userId: number;
  firstName: string;
  lastName: string;
  profileImageURL?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment: (doctorId: number) => void; onViewProfile: (doctorId: number) => void;

}

// Temporary placeholder data – replace with real API fields when available
const getPlaceholder = (doctor: Doctor) => {
  const specialties = ['Cardiology', 'Pediatrics', 'Neurology', 'Orthopedics', 'Dermatology', 'Ophthalmology'];
  const specialty = specialties[doctor.userId % specialties.length];
  const experience = 5 + (doctor.userId % 15);
  const fee = 80 + (doctor.userId % 150) + 20;
  const rating = (4 + (doctor.userId % 10) / 10).toFixed(1);
  const nextAvailable = ['Today, 04:00 PM', 'Tomorrow, 10:30 AM', 'Wed, 25 Oct', 'Fri, 27 Oct', 'Mon, 23 Oct', 'Tomorrow, 09:00 AM'];
  return {
    specialty,
    experience,
    fee,
    rating,
    nextAvailable: nextAvailable[doctor.userId % nextAvailable.length],
  };
};
  

export default function DoctorCard({ doctor, onBookAppointment, onViewProfile }: DoctorCardProps) {
  const { specialty, experience, fee, rating, nextAvailable } = getPlaceholder(doctor);

  return (
    <div className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition bg-white">
      {/* Doctor Name & Specialty & Rating */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Dr. {doctor.firstName} {doctor.lastName}
          </h3>
          <p className="text-sm text-gray-500">{specialty} Specialist</p>
        </div>
        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
          <span>⭐</span> {rating}
        </div>
      </div>

      {/* Experience & Fee */}
      <div className="mt-3 flex items-center justify-between text-sm border-t border-gray-100 pt-3">
        <div>
          <span className="font-medium text-gray-500">EXPERIENCE</span>
          <p className="font-semibold text-gray-700">{experience} Years</p>
        </div>
        <div className="text-right">
          <span className="font-medium text-gray-500">FEE</span>
          <p className="font-semibold text-gray-700">${fee.toFixed(2)}</p>
        </div>
      </div>

      {/* Next Available */}
      <div className="mt-3 text-sm border-t border-gray-100 pt-3">
        <span className="font-medium text-gray-500">NEXT AVAILABLE</span>
        <p className="font-semibold text-gray-700">{nextAvailable}</p>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onViewProfile(doctor.userId)}
          className="flex-1 bg-blue-50 text-blue-700 font-medium py-2 rounded-lg hover:bg-blue-100 transition"
        >
          View Profile
        </button>
        <button
          onClick={() => onBookAppointment(doctor.userId)}
          className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}