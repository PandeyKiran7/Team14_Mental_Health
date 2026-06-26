"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import {
  CONTENT_MANAGER_NAV_ITEMS,
  CONTENT_MANAGER_SIDEBAR_META,
} from "@/components/layout/contentManagerNav";
import { getStoredUser } from "@/lib/auth";
import { canManageBlogs } from "@/lib/roleAccess";
import { redirectIfSessionInvalid } from "@/lib/session";

const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/content-manager/blogs": {
    title: "Blog posts",
  },
  "/content-manager/blogs/new": {
    title: "New blog post",
  },
  "/content-manager/doctor-finance": {
    title: "Doctor finance",
  },
  "/content-manager/profile": {
    title: "My profile",
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
    if (redirectIfSessionInvalid()) return;

    const role = getStoredUser()?.role;

    if (!canManageBlogs(role)) {
      router.replace("/");
    }
  }, [router]);

  const meta = PAGE_META[pathname] ??
    (pathname.includes("/edit")
      ? { title: "Edit blog post" }
      : { title: "Internal manager" });

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
