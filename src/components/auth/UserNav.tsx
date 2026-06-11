"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";
import { getProfilePath } from "@/lib/profileRoutes";
import { getStoredUser, signOut, type StoredUser } from "@/lib/auth";

function getInitials(user: StoredUser | null): string {
  if (!user) return "U";
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || user.email?.[0]?.toUpperCase() || "U";
}

function getDisplayName(user: StoredUser | null): string {
  if (!user) return "User";
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.email ?? "User";
}

export default function UserNav() {
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleSignOut() {
    signOut();
    setOpen(false);
    router.push("/login");
  }

  const displayName = getDisplayName(user);
  const profilePath = getProfilePath(user?.role);

  return (
    <div className="relative" ref={popupRef}>
      <button
        type="button"
        className="flex rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open user menu"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
          {getInitials(user)}
        </div>
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-60 rounded-md bg-white shadow-lg ring-1 ring-black/5"
          role="menu"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-semibold text-teal-700">
                {getInitials(user)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-medium text-gray-800">
                  {displayName}
                </p>
                <p className="truncate text-sm font-medium capitalize text-teal-600">
                  {user?.role?.toLowerCase() ?? "user"}
                </p>
              </div>
            </div>
          </div>

          <div className="py-1">
            <Link
              href={profilePath}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <User className="mr-3 h-5 w-5 text-gray-500" />
              My Profile
            </Link>
            <button
              type="button"
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
