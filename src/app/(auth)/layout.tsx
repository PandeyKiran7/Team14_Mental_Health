import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";

export default function AuthLayout({
  children,
  maxWidth = "max-w-lg", // default for login, etc.
}: {
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="flex flex-1 flex-col bg-teal-50">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <Link href="/" className="mb-8 text-2xl font-bold text-teal-700">
          Diabetes Management System
        </Link>
        <div className={`w-full rounded-2xl border border-teal-100 bg-white p-8 ${maxWidth}`}>
          {children}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}