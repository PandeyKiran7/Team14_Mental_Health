import {
  CalendarIcon,
  DownloadSimpleIcon,
  HeartbeatIcon,
  SquaresFourIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import type { DashboardNavItem } from "@/components/layout/DashboardSidebar";
import { CalendarPlusIcon } from "lucide-react";

export const PATIENT_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/patient/dashboard",
    label: "Dashboard",
    icon: SquaresFourIcon,
  },
  {
    href: "/patient/bookings",
    label: "Appointments",
    icon: CalendarIcon,
  },
    {
    href: "/patient/doctors",          // <-- new item
    label: "Book Appointment",
    icon: CalendarPlusIcon,
  },

  {
    href: "/patient/reports",        // adjust to your actual route
    label: "Download Report",
    icon: DownloadSimpleIcon,
  },

  {
    href: "/patient/medical-profile",
    label: "Medical profile",
    icon: HeartbeatIcon,
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
