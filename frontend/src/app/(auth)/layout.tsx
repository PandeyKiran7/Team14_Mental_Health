import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-teal-50 px-4">
      <Link href="/" className="mb-8 text-2xl font-bold text-teal-700">
        MindWell
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-teal-100 bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
