"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { StoredUser } from "@/lib/auth";
import {
  resolveProfileImageUrl,
  uploadProfileImage,
} from "@/lib/profileImageApi";
import { getAccessToken } from "@/lib/auth";
import ApiMessage from "@/components/ui/ApiMessage";

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
  allowImageUpload?: boolean;
  onProfileImageUpdated?: (profileImageURL: string | undefined) => void;
};

export default function ProfileAccountHeader({
  user,
  className,
  allowImageUpload = false,
  onProfileImageUpdated,
}: ProfileAccountHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageSrc = resolveProfileImageUrl(user.profileImageURL);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const result = await uploadProfileImage(file, getAccessToken() ?? undefined);

    setUploading(false);

    if (!result.ok) {
      setUploadError(result.message);
      return;
    }

    onProfileImageUpdated?.(result.profileImageURL ?? undefined);
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-lg border border-teal-50 bg-teal-50/40 p-4",
        className,
      )}
    >
      <div className="relative shrink-0">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={getDisplayName(user)}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-xl font-semibold text-white">
            {getInitials(user)}
          </div>
        )}

        {allowImageUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFileChange(e)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 rounded-full border border-white bg-teal-700 px-2 py-0.5 text-[10px] font-medium text-white shadow hover:bg-teal-800 disabled:opacity-60"
            >
              {uploading ? "…" : "Edit"}
            </button>
          </>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-lg font-semibold text-zinc-900">{getDisplayName(user)}</p>
        <p className="text-sm text-zinc-600">{user.email}</p>
        <span className="mt-2 inline-flex rounded-full bg-white px-2.5 py-0.5 text-xs font-medium capitalize text-teal-700 ring-1 ring-teal-100">
          {user.role?.toLowerCase() ?? "user"}
        </span>
        {uploadError && (
          <div className="mt-2">
            <ApiMessage message={uploadError} variant="error" />
          </div>
        )}
      </div>
    </div>
  );
}
