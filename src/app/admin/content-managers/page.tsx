import { redirect } from "next/navigation";

export default function AdminContentManagersPage() {
  redirect("/admin/users?tab=managers");
}
