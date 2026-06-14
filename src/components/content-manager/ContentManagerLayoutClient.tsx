"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import {
  CONTENT_MANAGER_NAV_ITEMS,
  CONTENT_MANAGER_SIDEBAR_META,
} from "@/components/layout/contentManagerNav";
import { getAccessToken, getStoredUser } from "@/lib/auth";
import { canManageBlogs } from "@/lib/roleAccess";

const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/content-manager/blogs": {
    title: "Blog posts",
    subtitle: "Create, publish, and manage health articles",
  },
  "/content-manager/blogs/new": {
    title: "New blog post",
    subtitle: "Write and publish a new article",
  },
  "/content-manager/profile": {
    title: "My profile",
    subtitle: "Your content manager account",
  },
};

export default function ContentManagerLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getAccessToken();
    const role = getStoredUser()?.role;

    if (!token || !canManageBlogs(role)) {
      router.replace("/login");
    }
  }, [router]);

  const meta = PAGE_META[pathname] ??
    (pathname.includes("/edit")
      ? {
          title: "Edit blog post",
          subtitle: "Update article content and status",
        }
      : {
          title: "Content manager",
          subtitle: "Diabetes Management System",
        });

  return (
    <DashboardShell
      role="content-manager"
      title={meta.title}
      subtitle={meta.subtitle}
    >
      {children}
    </DashboardShell>
  );
}
