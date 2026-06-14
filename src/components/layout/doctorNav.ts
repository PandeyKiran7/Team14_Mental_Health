import {
  CalendarIcon,
  SquaresFourIcon,
  StethoscopeIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import type { DashboardNavItem } from "@/components/layout/DashboardSidebar";

export const DOCTOR_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/doctor/dashboard",
    label: "Overview",
    icon: SquaresFourIcon,
  },
  {
    href: "/doctor/bookings",
    label: "Appointments",
    icon: CalendarIcon,
  },
  {
    href: "/doctor/profile",
    label: "My Profile",
    icon: UserCircleIcon,
  },
];

export const DOCTOR_SIDEBAR_META = {
  homeHref: "/doctor/dashboard",
  panelTitle: "Doctor Panel",
  panelSubtitle: "Practice",
  panelIcon: StethoscopeIcon,
} as const;
