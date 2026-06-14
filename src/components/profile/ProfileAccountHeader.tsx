import { cn } from "@/lib/utils";
import type { StoredUser } from "@/lib/auth";

function getInitials(user: StoredUser): string {
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || user.email?.[0]?.toUpperCase() || "U";
}

function getDisplayName(user: StoredUser): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.email ?? "User";
}

type ProfileAccountHeaderProps = {
  user: StoredUser;
  className?: string;
};

export default function ProfileAccountHeader({
  user,
  className,
}: ProfileAccountHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-lg border border-teal-50 bg-teal-50/40 p-4",
        className,
      )}
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xl font-semibold text-white">
        {getInitials(user)}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold text-zinc-900">{getDisplayName(user)}</p>
        <p className="text-sm text-zinc-600">{user.email}</p>
        <span className="mt-2 inline-flex rounded-full bg-white px-2.5 py-0.5 text-xs font-medium capitalize text-teal-700 ring-1 ring-teal-100">
          {user.role?.toLowerCase() ?? "user"}
        </span>
      </div>
    </div>
  );
}
