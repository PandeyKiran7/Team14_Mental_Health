"use client";

import { useState } from "react";
import { ListIcon } from "@phosphor-icons/react";
import UserNav from "@/components/auth/UserNav";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import SiteHeader from "@/components/layout/SiteHeader";
import {
  DOCTOR_NAV_ITEMS,
  DOCTOR_SIDEBAR_META,
} from "@/components/layout/doctorNav";
import {
  PATIENT_NAV_ITEMS,
  PATIENT_SIDEBAR_META,
} from "@/components/layout/patientNav";
import {
  CONTENT_MANAGER_NAV_ITEMS,
  CONTENT_MANAGER_SIDEBAR_META,
} from "@/components/layout/contentManagerNav";
import SiteFooter from "@/components/layout/SiteFooter";

type DashboardRole = "patient" | "doctor" | "content-manager";

type DashboardShellProps = {
  role: DashboardRole;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

const ROLE_CONFIG = {
  patient: {
    items: PATIENT_NAV_ITEMS,
    ...PATIENT_SIDEBAR_META,
  },
  doctor: {
    items: DOCTOR_NAV_ITEMS,
    ...DOCTOR_SIDEBAR_META,
  },
  "content-manager": {
    items: CONTENT_MANAGER_NAV_ITEMS,
    ...CONTENT_MANAGER_SIDEBAR_META,
  },
} as const;

export default function DashboardShell({
  role,
  title,
  subtitle,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const config = ROLE_CONFIG[role];

  const usesSiteHeader = role === "patient" || role === "doctor";
  const panelMenuLabel = role === "patient" ? "Patient menu" : "Doctor menu";

  return (
    <div className="flex min-h-screen flex-1 w-full bg-slate-50">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        homeHref={config.homeHref}
        panelTitle={config.panelTitle}
        panelSubtitle={config.panelSubtitle}
        panelIcon={config.panelIcon}
        items={config.items}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        {usesSiteHeader ? (
          <div className="sticky top-0 z-50 shrink-0 bg-white">
            <SiteHeader embedded />
            <div className="border-b border-teal-100 px-4 py-2 lg:hidden">
              <button
                type="button"
                aria-label="Open menu"
                className="inline-flex items-center gap-2 rounded-lg border border-teal-200 px-3 py-1.5 text-sm font-medium text-teal-800 hover:bg-teal-50"
                onClick={() => setSidebarOpen(true)}
              >
                <ListIcon size={18} />
                {panelMenuLabel}
              </button>
            </div>
          </div>
        ) : (
          <header className="sticky top-0 z-50 shrink-0 border-b border-teal-100 bg-white">
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
              </div>

              <UserNav />
            </div>
          </header>
        )}

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-2xl font-bold text-teal-800">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
