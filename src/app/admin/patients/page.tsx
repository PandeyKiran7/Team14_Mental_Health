import RoleUsersTable from "@/components/admin/RoleUsersTable";

export default function AdminPatientsPage() {
  return (
    <RoleUsersTable
      endpoint="patients"
      emptyMessage="No patients registered yet."
    />
  );
}
