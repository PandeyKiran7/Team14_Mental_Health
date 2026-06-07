"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SignOutButton from "@/components/auth/SignOutButton";
import SiteFooter from "@/components/layout/SiteFooter";
import { getStoredUser, type StoredUser } from "@/lib/auth";

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
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email ?? "User";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-teal-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-lg font-bold text-teal-700">
            Diabetes Management System
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-600 sm:inline">
              {displayName}
              {user?.role ? ` · ${user.role}` : ""}
            </span>
            <SignOutButton />
          </div>
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
