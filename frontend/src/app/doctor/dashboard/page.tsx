import Link from "next/link";

export default function DoctorDashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <h1 className="text-2xl font-bold text-teal-800">Doctor Dashboard</h1>
      <p className="mt-2 text-zinc-600">Appointments · Patient mood (coming soon)</p>
      <Link href="/" className="mt-6 inline-block text-teal-600 hover:underline">
        ← Home
      </Link>
    </div>
  );
}
