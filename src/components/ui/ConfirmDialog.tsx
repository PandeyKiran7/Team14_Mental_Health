"use client";

import { WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="relative z-10 w-full max-w-md rounded-xl border border-teal-100 bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
        >
          <XIcon size={18} />
        </button>

        <div className="flex gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
              variant === "danger" ? "bg-red-100 text-red-600" : "bg-teal-100 text-teal-700",
            )}
          >
            <WarningCircleIcon size={24} weight="fill" />
          </div>
          <div className="min-w-0 pr-6">
            <h2 id="confirm-dialog-title" className="text-lg font-semibold text-zinc-900">
              {title}
            </h2>
            <p id="confirm-dialog-message" className="mt-2 text-sm text-zinc-600">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60",
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-teal-600 hover:bg-teal-700",
            )}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
