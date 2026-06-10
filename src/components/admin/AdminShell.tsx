"use client";

import Link from "next/link";
import { useState } from "react";
import { ListIcon } from "@phosphor-icons/react";
import UserNav from "@/components/auth/UserNav";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SiteFooter from "@/components/layout/SiteFooter";

type AdminShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AdminShell({
  title,
  subtitle,
  children,
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-teal-100 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open menu"
                className="rounded-lg border border-teal-200 p-2 text-teal-800 hover:bg-teal-50 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <ListIcon size={20} />
              </button>
              <Link
                href="/"
                className="hidden text-sm font-medium text-teal-700 hover:text-teal-800 sm:inline"
              >
                ← Back to site
              </Link>
            </div>

            <UserNav />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-teal-800">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
            )}
          </div>
          {children}
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
