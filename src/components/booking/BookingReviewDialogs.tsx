"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";

type ReviewTarget = {
  patient: { name: string };
  bookingDate: string;
  startTime: string;
};

type BookingReviewDialogsProps = {
  approveTargetId: number | null;
  approveError: string | null;
  denyTargetId: number | null;
  denyError: string | null;
  actionId: number | null;
  getTarget: (bookingId: number) => ReviewTarget | undefined;
  onConfirmApprove: () => void;
  onConfirmDeny: () => void;
  onCancelApprove: () => void;
  onCancelDeny: () => void;
  denyConfirmLabel?: string;
};

export default function BookingReviewDialogs({
  approveTargetId,
  approveError,
  denyTargetId,
  denyError,
  actionId,
  getTarget,
  onConfirmApprove,
  onConfirmDeny,
  onCancelApprove,
  onCancelDeny,
  denyConfirmLabel = "Deny",
}: BookingReviewDialogsProps) {
  const approveTarget =
    approveTargetId != null ? getTarget(approveTargetId) : undefined;

  return (
    <>
      <ConfirmDialog
        open={approveTargetId !== null}
        title="Approve appointment?"
        message={
          approveTarget
            ? `Confirm appointment for ${approveTarget.patient.name} on ${approveTarget.bookingDate} at ${approveTarget.startTime}?`
            : "Are you sure you want to approve this appointment request?"
        }
        confirmLabel="Approve"
        cancelLabel="Cancel"
        loading={actionId === approveTargetId}
        error={approveError}
        onConfirm={onConfirmApprove}
        onCancel={onCancelApprove}
      />

      <ConfirmDialog
        open={denyTargetId !== null}
        title="Deny appointment?"
        message="Are you sure you want to deny this appointment request?"
        confirmLabel={denyConfirmLabel}
        cancelLabel="Cancel"
        variant="danger"
        loading={actionId === denyTargetId}
        error={denyError}
        onConfirm={onConfirmDeny}
        onCancel={onCancelDeny}
      />
    </>
  );
}
