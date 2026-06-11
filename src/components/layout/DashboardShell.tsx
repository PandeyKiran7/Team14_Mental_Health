"use client";

import Link from "next/link";
import UserNav from "@/components/auth/UserNav";
import SiteFooter from "@/components/layout/SiteFooter";

type DashboardShellProps = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export default function DashboardShell({
  title,
  subtitle,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-teal-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-lg font-bold text-teal-700">
            Diabetes Management System
          </Link>
          <UserNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-8">
        <h1 className="text-2xl font-bold text-teal-800">{title}</h1>
        <p className="mt-2 text-zinc-600">{subtitle}</p>
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
