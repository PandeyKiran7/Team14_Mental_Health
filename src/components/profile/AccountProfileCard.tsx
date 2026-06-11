"use client";

import { useEffect, useState } from "react";
import { getStoredUser, type StoredUser } from "@/lib/auth";

export default function AccountProfileCard() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  if (!user) {
    return (
      <p className="text-sm text-zinc-500">No account information found. Please log in again.</p>
    );
  }

  const fields = [
    { label: "First name", value: user.firstName },
    { label: "Last name", value: user.lastName },
    { label: "Email", value: user.email },
    { label: "Role", value: user.role },
    { label: "User ID", value: user.userId?.toString() },
  ];

  return (
    <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-teal-800">Account information</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {field.label}
            </dt>
            <dd className="mt-1 text-sm font-medium capitalize text-zinc-800">
              {field.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
