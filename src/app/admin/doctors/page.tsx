import RoleUsersTable from "@/components/admin/RoleUsersTable";

export default function AdminDoctorsPage() {
  return (
    <RoleUsersTable endpoint="doctors" emptyMessage="No doctors registered yet." />
  );
}
