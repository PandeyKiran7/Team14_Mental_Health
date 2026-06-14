import DoctorLayoutClient from "@/components/doctor/DoctorLayoutClient";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DoctorLayoutClient>{children}</DoctorLayoutClient>;
}
