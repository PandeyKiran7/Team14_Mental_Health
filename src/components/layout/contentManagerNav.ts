"use client";

import { BookOpenIcon, CurrencyDollarIcon, UserIcon } from "@phosphor-icons/react";
import type { DashboardNavItem } from "@/components/layout/DashboardSidebar";

export const CONTENT_MANAGER_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/content-manager/blogs",
    label: "Blog posts",
    icon: BookOpenIcon,
  },
  {
    href: "/content-manager/doctor-finance",
    label: "Doctor finance",
    icon: CurrencyDollarIcon,
  },
  {
    href: "/content-manager/profile",
    label: "Profile",
    icon: UserIcon,
  },
];

export const CONTENT_MANAGER_SIDEBAR_META = {
  homeHref: "/content-manager/blogs",
  panelTitle: "Internal Manager",
  panelSubtitle: "Blog management",
  panelIcon: BookOpenIcon,
};
