import RoleUsersTable from "@/components/admin/RoleUsersTable";

export default function AdminContentManagersPage() {
  return (
    <RoleUsersTable
      endpoint="content_managers"
      emptyMessage="No content managers registered yet."
    />
  );
}
