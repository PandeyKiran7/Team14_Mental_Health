import { redirect } from "next/navigation";

export default function AdminRegisterPatientRedirectPage() {
  redirect("/admin/users/register/patient");
}
