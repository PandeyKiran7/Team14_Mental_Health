import DashboardShell from "@/components/layout/DashboardShell";
import AccountProfileCard from "@/components/profile/AccountProfileCard";
import UserAccountForm from "@/components/profile/UserAccountForm";
import PatientMedicalDataForm from "@/components/patient/PatientMedicalDataForm";

export default function PatientProfilePage() {
  return (
    <DashboardShell
      title="Patient profile"
      subtitle="Complete your medical details to use the platform"
    >
      <div className="space-y-6">
        <AccountProfileCard />
        <UserAccountForm />
        <PatientMedicalDataForm />
      </div>
    </DashboardShell>
  );
}
