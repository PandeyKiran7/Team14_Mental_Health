"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function SignOutButton() {
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
    >
      Sign out
    </button>
  );
}
