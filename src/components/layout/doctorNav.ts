import {
  SquaresFourIcon,
  StethoscopeIcon,
  UserCircleIcon,
  PrescriptionIcon,
} from "@phosphor-icons/react";
import type { DashboardNavItem } from "@/components/layout/DashboardSidebar";
import { CalendarIcon, ClipboardList } from "lucide-react";

export const DOCTOR_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/doctor/dashboard",
    label: "Dashboard",
    icon: SquaresFourIcon,
  },
  {
    href: "/doctor/bookings",
    label: "Appointments",
    icon: CalendarIcon,
  },
  {
    href: "/doctor/Prescription",
    label: "Prescriptions",
    icon: PrescriptionIcon,
  },
  {
    href: "/doctor/Recommendation",
    label: "Recommendations",
    icon: ClipboardList,
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