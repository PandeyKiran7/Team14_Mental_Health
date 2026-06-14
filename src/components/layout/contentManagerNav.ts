"use client";

import { BookOpenIcon, UserIcon } from "@phosphor-icons/react";
import type { DashboardNavItem } from "@/components/layout/DashboardSidebar";

export const CONTENT_MANAGER_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/content-manager/blogs",
    label: "Blog posts",
    icon: BookOpenIcon,
  },
  {
    href: "/content-manager/profile",
    label: "Profile",
    icon: UserIcon,
  },
];

export const CONTENT_MANAGER_SIDEBAR_META = {
  homeHref: "/content-manager/blogs",
  panelTitle: "Content Manager",
  panelSubtitle: "Blog management",
  panelIcon: BookOpenIcon,
};
