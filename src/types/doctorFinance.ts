import { extractApiArray, extractApiEntity } from "@/helper/apiResponse";

export type DoctorFinanceBooking = {
  bookingId: number;
  date: string;
  status: string;
  paymentStatus: string;
  isSettled: boolean;
  amount: number;
  platformCut: number;
  doctorEarning: number;
};

export type DoctorFinancePayment = {
  paymentId: number;
  bookingId: number;
  amount: number;
  status: string;
  isSettled: boolean;
  transactionId?: string;
  paidAt?: string;
  createdAt?: string;
};

export type DoctorFinanceDetails = {
  doctorId: number;
  totalRevenue: number;
  totalPlatformCut: number;
  totalDoctorEarning: number;
  bookings: DoctorFinanceBooking[];
  paymentData: DoctorFinancePayment[];
};

export type PayoutResult = {
  payoutId: number;
  totalAmount: number;
  totalPayments: number;
  status: string;
};

export type PayoutHistoryPayment = {
  paymentId: number;
  amount: number;
  status: string;
  transactionId: string;
  createdAt: string;
  paidAt: string;
  isSettled: boolean;
};

export type PayoutHistoryItem = {
  id: number;
  doctorEarning: string;
  payment: PayoutHistoryPayment;
};

export type PayoutHistoryEntry = {
  payoutId: number;
  totalAmount: string;
  status: string;
  paidAt: string;
  createdAt: string;
  items: PayoutHistoryItem[];
};

export type PayoutHistory = PayoutHistoryEntry[];

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function asBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === true) return true;
  return false;
}

export function normalizeDoctorFinanceDetails(body: unknown): DoctorFinanceDetails | null {
  const entity = extractApiEntity<Record<string, unknown>>(body, "doctorId");
  if (!entity) return null;

  const bookings = Array.isArray(entity.bookings)
    ? entity.bookings.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          bookingId: asNumber(row.bookingId),
          date: String(row.date ?? ""),
          status: String(row.status ?? ""),
          paymentStatus: String(row.paymentStatus ?? ""),
          isSettled: asBool(row.isSettled),
          amount: asNumber(row.amount),
          platformCut: asNumber(row.platformCut),
          doctorEarning: asNumber(row.doctorEarning),
        };
      })
    : [];

  const paymentData = Array.isArray(entity.paymentData)
    ? entity.paymentData.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          paymentId: asNumber(row.paymentId),
          bookingId: asNumber(row.bookingId),
          amount: asNumber(row.amount),
          status: String(row.status ?? ""),
          isSettled: asBool(row.isSettled),
          transactionId:
            typeof row.transactionId === "string" ? row.transactionId : undefined,
          paidAt: row.paidAt ? String(row.paidAt) : undefined,
          createdAt: row.createdAt ? String(row.createdAt) : undefined,
        };
      })
    : [];

  return {
    doctorId: asNumber(entity.doctorId),
    totalRevenue: asNumber(entity.totalRevenue),
    totalPlatformCut: asNumber(entity.totalPlatformCut),
    totalDoctorEarning: asNumber(entity.totalDoctorEarning),
    bookings,
    paymentData,
  };
}

export function normalizePayoutResult(body: unknown): PayoutResult | null {
  const entity = extractApiEntity<Record<string, unknown>>(body, "payoutId");
  if (!entity) return null;

  return {
    payoutId: asNumber(entity.payoutId),
    totalAmount: asNumber(entity.totalAmount),
    totalPayments: asNumber(entity.totalPayments),
    status: String(entity.status ?? ""),
  };
}

export function normalizePayoutHistory(body: unknown): PayoutHistory {
  return extractApiArray<Record<string, unknown>>(body).map((entry) => ({
    payoutId: asNumber(entry.payoutId),
    totalAmount: String(entry.totalAmount ?? ""),
    status: String(entry.status ?? ""),
    paidAt: String(entry.paidAt ?? ""),
    createdAt: String(entry.createdAt ?? ""),
    items: Array.isArray(entry.items)
      ? entry.items.map((item: Record<string, unknown>) => ({
          id: asNumber(item.id),
          doctorEarning: String(item.doctorEarning ?? ""),
          payment: {
            paymentId: asNumber((item.payment as Record<string, unknown>)?.paymentId),
            amount: asNumber((item.payment as Record<string, unknown>)?.amount),
            status: String((item.payment as Record<string, unknown>)?.status ?? ""),
            transactionId: String((item.payment as Record<string, unknown>)?.transactionId ?? ""),
            createdAt: String((item.payment as Record<string, unknown>)?.createdAt ?? ""),
            paidAt: String((item.payment as Record<string, unknown>)?.paidAt ?? ""),
            isSettled: asBool((item.payment as Record<string, unknown>)?.isSettled),
          },
        }))
      : [],
  }));
}
