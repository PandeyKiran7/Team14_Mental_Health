import { redirect } from "next/navigation";
import PatientProfileContent from "@/components/patient/PatientProfileContent";

type PatientProfilePageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function PatientProfilePage({
  searchParams,
}: PatientProfilePageProps) {
  const { tab } = await searchParams;
  if (tab === "medical") {
    redirect("/patient/medical-profile");
  }

  return <PatientProfileContent />;
}
