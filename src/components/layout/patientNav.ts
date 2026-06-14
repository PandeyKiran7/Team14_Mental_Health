import {
  CalendarIcon,
  HeartbeatIcon,
  SquaresFourIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import type { DashboardNavItem } from "@/components/layout/DashboardSidebar";

export const PATIENT_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/patient/dashboard",
    label: "Overview",
    icon: SquaresFourIcon,
  },
  {
    href: "/patient/bookings",
    label: "Appointments",
    icon: CalendarIcon,
  },
  {
    href: "/patient/profile",
    label: "My Profile",
    icon: UserCircleIcon,
  },
];

export const PATIENT_SIDEBAR_META = {
  homeHref: "/patient/dashboard",
  panelTitle: "Patient Panel",
  panelSubtitle: "My health",
  panelIcon: HeartbeatIcon,
} as const;
