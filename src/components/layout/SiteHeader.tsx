"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import UserNav from "@/components/auth/UserNav";
import { getSiteNavItems, isPanelOnlyNavRole, usesPanelDashboard } from "@/components/layout/siteNav";
import { getDashboardPath } from "@/lib/profileRoutes";
import { getStoredUser, type StoredUser } from "@/lib/auth";

const SITE_NAME = "Diabetes Management System";

type SiteHeaderProps = {
  /** Inside dashboard shell — parent handles sticky positioning. */
  embedded?: boolean;
};

export default function SiteHeader({ embedded = false }: SiteHeaderProps) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function syncUser() {
      setUser(getStoredUser());
      setReady(true);
    }

    syncUser();

    window.addEventListener("storage", syncUser);
    window.addEventListener("auth-change", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth-change", syncUser);
    };
  }, []);

  const dashboardPath = getDashboardPath(user?.role);
  const nav = getSiteNavItems(user?.role);
  const panelOnly = ready && user && isPanelOnlyNavRole(user.role);
  const showDashboard = ready && user && usesPanelDashboard(user.role);
  const isPatient = ready && user?.role?.toLowerCase() === "patient";
  const isDoctor = ready && user?.role?.toLowerCase() === "doctor";
  const brandHref = panelOnly ? dashboardPath : "/";

  return (
    <header
      className={
        embedded
          ? "border-b border-teal-100 bg-white"
          : "sticky top-0 z-50 shrink-0 border-b border-teal-100 bg-white"
      }
    >
      <div
        className={
          embedded
            ? "flex w-full items-center justify-between px-4 py-4 lg:px-8"
            : "mx-auto flex max-w-6xl items-center justify-between px-4 py-4"
        }
      >
        <Link href={brandHref} className="text-lg font-bold text-teal-700 md:text-xl">
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-zinc-700 md:gap-6">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-teal-600">
              {item.label}
            </Link>
          ))}

          {ready && user ? (
            <>
              {showDashboard && (
                <Link
                  href={dashboardPath}
                  className={
                    panelOnly || isPatient || isDoctor
                      ? "rounded-full bg-teal-600 px-4 py-2 text-white hover:bg-teal-700"
                      : "hidden rounded-full bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 sm:inline-block"
                  }
                >
                  Dashboard
                </Link>
              )}
              <UserNav />
            </>
          ) : ready ? (
            <>
              <Link
                href="/register"
                className="hidden rounded-full bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 sm:inline-block"
              >
                Register
              </Link>
              <Link href="/login" className="hover:text-teal-600">
                Login
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
