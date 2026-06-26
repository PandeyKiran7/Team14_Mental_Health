import { Suspense } from "react";
import AdminUsersTabs from "@/components/admin/AdminUsersTabs";

function UsersTabsFallback() {
  return (
    <div className="rounded-xl border border-teal-100 bg-white p-8 text-center">
      <p className="text-sm text-zinc-500">Loading users…</p>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<UsersTabsFallback />}>
      <AdminUsersTabs />
    </Suspense>
  );
}
