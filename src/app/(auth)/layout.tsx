import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-teal-50">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <Link href="/" className="mb-8 text-2xl font-bold text-teal-700">
          Diabetes Management System
        </Link>
        <div className="w-full max-w-lg rounded-2xl border border-teal-100 bg-white p-8">
          {children}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
