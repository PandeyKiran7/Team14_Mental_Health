"use client";

import RoleUsersTable from "@/components/admin/RoleUsersTable";
import AdminPatientMedicalLookup from "@/components/admin/AdminPatientMedicalLookup";

export default function AdminPatientsPanel() {
  return (
    <div className="space-y-8">
      <RoleUsersTable
        endpoint="patients"
        emptyMessage="No patients registered yet."
      />
      <AdminPatientMedicalLookup />
    </div>
  );
}
