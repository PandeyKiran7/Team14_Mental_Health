import BookingsPanel from '@/components/booking/BookingsPanel';

type PatientBookingsPageProps = {
  searchParams: Promise<{ doctorId?: string }>;
};

export default async function PatientBookingsPage({ searchParams }: PatientBookingsPageProps) {
  const { doctorId } = await searchParams;
  return <BookingsPanel doctorId={doctorId ? parseInt(doctorId) : undefined} />;
}