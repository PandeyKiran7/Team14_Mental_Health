// components/booking/BookingModal.tsx
import BookAppointmentForm from './BookAppointmentForm';

export default function BookingModal({
  isOpen,
  onClose,
  doctorId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number;
  onSuccess?: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <button onClick={onClose} className="float-right text-gray-500">✕</button>
        <BookAppointmentForm
          initialDoctorId={doctorId}
          hideDoctorSelector={true}
          onBooked={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
}