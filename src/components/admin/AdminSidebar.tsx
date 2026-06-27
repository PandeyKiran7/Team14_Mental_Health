"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  ChartLineUpIcon,
  PulseIcon,
  SquaresFourIcon,
  UsersIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: SquaresFourIcon,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: UsersIcon,
  },
  {
    href: "/admin/content-managers",
    label: "Internal managers",
    icon: BookOpenIcon,
  },
  {
    href: "/admin/monitoring",
    label: "Monitoring",
    icon: PulseIcon,
  },
] as const;

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-zinc-900/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-svh w-64 flex-col border-r border-teal-100 bg-white transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-teal-100 px-5 py-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
              <ChartLineUpIcon size={20} weight="bold" />
            </span>
            <div>
              <p className="text-sm font-bold text-teal-800">Admin Panel</p>
              <p className="text-xs text-zinc-500">Management</p>
            </div>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-teal-50 lg:hidden"
            onClick={onClose}
          >
            <XIcon size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide p-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin/users"
                ? pathname === href ||
                  pathname.startsWith("/admin/users/") ||
                  pathname.startsWith("/admin/doctors") ||
                  pathname.startsWith("/admin/patients")
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-teal-600 text-white"
                    : "text-zinc-700 hover:bg-teal-50 hover:text-teal-800",
                )}
              >
                <Icon size={20} weight={active ? "fill" : "regular"} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-teal-100 p-4">
          <p className="text-xs text-zinc-500">
            Diabetes Management System
          </p>
        </div>
      </aside>
    </>
  );
}
