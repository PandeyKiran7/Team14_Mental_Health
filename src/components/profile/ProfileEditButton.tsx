"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";

type ProfileEditButtonProps = {
  onClick: () => void;
  label?: string;
};

export default function ProfileEditButton({
  onClick,
  label = "Edit",
}: ProfileEditButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
    >
      <PencilSimpleIcon size={16} />
      {label}
    </button>
  );
}
