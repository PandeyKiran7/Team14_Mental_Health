'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DoctorCard from '@/components/patient/DoctorCard';
import BookingModal from '@/components/booking/BookingModal';  // NEW
import { apiGetCall } from '@/helper/apiService';

interface Doctor {
  userId: number;
  firstName: string;
  lastName: string;
  profileImageURL: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await apiGetCall({ endpoint: 'doctors' });
        if (response.status === 200 && response.data?.success) {
          setDoctors(response.data.data);
        } else {
          console.error('Failed to fetch doctors');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Modal open handler
  const handleBookAppointment = (doctorId: number) => {
    setSelectedDoctorId(doctorId);
    setIsModalOpen(true);
  };

  const handleViewProfile = (doctorId: number) => {
  router.push(`/patient/doctors/${doctorId}`);
  };

  const filteredDoctors = doctors.filter((doc) => {
    const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query);
  });

  if (loading) return <div className="p-4">Loading doctors...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800">Find a Specialist</h1>
      <p className="text-gray-600 mt-1">Quality care is just a few clicks away.</p>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Search by doctor name, specialty, or condition..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Count */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">AVAILABLE SPECIALISTS</h2>
        <span className="text-sm text-gray-500">{filteredDoctors.length} Doctors found</span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <DoctorCard
            key={doctor.userId}
            doctor={doctor}
            onBookAppointment={handleBookAppointment}   // changed
            onViewProfile={handleViewProfile}
          />
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="mt-10 text-center text-gray-500">No doctors match your search.</div>
      )}

      {selectedDoctorId && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          doctorId={selectedDoctorId}
          onSuccess={() => {
            console.log('Booking successful!');
          }}
        />
      )}
    </div>
  );
}