"use client";

import { useCallback, useState } from "react";
import { getNetworkErrorMessage } from "@/helper/apiErrors";
import { approveBooking, denyBooking } from "@/lib/bookingActions";
import { getAccessToken } from "@/lib/auth";
import { handleSessionExpired } from "@/lib/session";

type ActionResult = { ok: true } | { ok: false; message: string };

async function runReviewAction(
  bookingId: number,
  action: (id: number, token: string) => Promise<ActionResult>,
): Promise<ActionResult> {
  const token = getAccessToken();
  if (!token) {
    handleSessionExpired();
    return { ok: false, message: "Session expired." };
  }

  try {
    return await action(bookingId, token);
  } catch (error) {
    return { ok: false, message: getNetworkErrorMessage(error) };
  }
}

export function useBookingReview(onComplete: () => Promise<void>) {
  const [actionId, setActionId] = useState<number | null>(null);
  const [approveTargetId, setApproveTargetId] = useState<number | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [denyTargetId, setDenyTargetId] = useState<number | null>(null);
  const [denyError, setDenyError] = useState<string | null>(null);

  const confirmApprove = useCallback(async () => {
    if (approveTargetId == null) return;

    setActionId(approveTargetId);
    setApproveError(null);

    const result = await runReviewAction(approveTargetId, approveBooking);
    if (!result.ok) {
      setApproveError(result.message);
      setActionId(null);
      return;
    }

    setApproveTargetId(null);
    setActionId(null);
    await onComplete();
  }, [approveTargetId, onComplete]);

  const confirmDeny = useCallback(async () => {
    if (denyTargetId == null) return;

    setActionId(denyTargetId);
    setDenyError(null);

    const result = await runReviewAction(denyTargetId, denyBooking);
    if (!result.ok) {
      setDenyError(result.message);
      setActionId(null);
      return;
    }

    setDenyTargetId(null);
    setActionId(null);
    await onComplete();
  }, [denyTargetId, onComplete]);

  return {
    actionId,
    approveTargetId,
    approveError,
    denyTargetId,
    denyError,
    requestApprove: (bookingId: number) => {
      setApproveError(null);
      setApproveTargetId(bookingId);
    },
    requestDeny: (bookingId: number) => {
      setDenyError(null);
      setDenyTargetId(bookingId);
    },
    cancelApprove: () => {
      if (actionId !== null) return;
      setApproveTargetId(null);
      setApproveError(null);
    },
    cancelDeny: () => {
      if (actionId !== null) return;
      setDenyTargetId(null);
      setDenyError(null);
    },
    confirmApprove,
    confirmDeny,
  };
}
