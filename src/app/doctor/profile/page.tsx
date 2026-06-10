import DashboardShell from "@/components/layout/DashboardShell";
import AccountProfileCard from "@/components/profile/AccountProfileCard";
import UserAccountForm from "@/components/profile/UserAccountForm";
import DoctorProfileForm from "@/components/doctor/DoctorProfileForm";

export default function DoctorProfilePage() {
  return (
    <DashboardShell
      title="My Profile"
      subtitle="Your account and professional details"
    >
      <div className="space-y-6">
        <AccountProfileCard />
        <UserAccountForm />
        <DoctorProfileForm />
      </div>
    </DashboardShell>
  );
}
