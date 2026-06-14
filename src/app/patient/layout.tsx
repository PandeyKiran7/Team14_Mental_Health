import PatientLayoutClient from "@/components/patient/PatientLayoutClient";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PatientLayoutClient>{children}</PatientLayoutClient>;
}
