import type { ReactNode } from "react";

type BookingDocumentSectionProps = {
  title: string;
  error: string | null;
  loading: boolean;
  loadingLabel: string;
  exists: boolean;
  isDoctor: boolean;
  editing: boolean;
  saving: boolean;
  downloading: boolean;
  editLabel: string;
  emptyLabel: string;
  onToggleEdit: () => void;
  onDownload: () => void;
  form: ReactNode;
  view: ReactNode;
};

export default function BookingDocumentSection({
  title,
  error,
  loading,
  loadingLabel,
  exists,
  isDoctor,
  editing,
  saving,
  downloading,
  editLabel,
  emptyLabel,
  onToggleEdit,
  onDownload,
  form,
  view,
}: BookingDocumentSectionProps) {
  if (loading) {
    return <p className="text-sm text-zinc-500">{loadingLabel}</p>;
  }

  return (
    <div className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-medium text-teal-800">{title}</h4>
        <div className="flex gap-2">
          {exists && (
            <button
              type="button"
              disabled={downloading}
              onClick={onDownload}
              className="text-xs font-medium text-teal-700 underline disabled:opacity-60"
            >
              {downloading ? "Downloading…" : "Download PDF"}
            </button>
          )}
          {isDoctor && !exists && (
            <button
              type="button"
              disabled={saving}
              onClick={onToggleEdit}
              className="text-xs font-medium text-teal-700 underline disabled:opacity-60"
            >
              {editing ? "Cancel" : editLabel}
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {editing && isDoctor ? (
        form
      ) : exists ? (
        view
      ) : (
        <p className="mt-2 text-sm text-zinc-500">{emptyLabel}</p>
      )}
    </div>
  );
}
