"use client";

import Link from "next/link";
import ContentManagersTable from "@/components/admin/ContentManagersTable";

export default function AdminContentManagersPanel() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          Register content managers and view their accounts.
        </p>
        <Link
          href="/admin/content-managers/register"
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Register content manager
        </Link>
      </div>

      <ContentManagersTable />
    </div>
  );
}
