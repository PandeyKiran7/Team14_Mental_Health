import { redirect } from "next/navigation";

export default function AdminRegisterDoctorRedirectPage() {
  redirect("/admin/users/register/doctor");
}
