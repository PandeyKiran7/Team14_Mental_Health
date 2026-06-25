import { extractApiEntity } from "@/helper/apiResponse";

export type DoctorFinanceSummary = {
  totalBookings: number;
  totalRevenue: number;
  platformCut: number;
  doctorEarning: number;
};

export type DoctorFinanceBooking = {
  bookingId: number;
  date: string;
  status: string;
  paymentStatus: string;
  amount: number;
  platformCut: number;
  doctorEarning: number;
};

export type DoctorFinancePayment = {
  paymentId: number;
  bookingId: number;
  amount: number;
  status: string;
  transactionId?: string;
  paidAt?: string;
  createdAt?: string;
};

export type DoctorFinanceDetails = {
  doctorId: number;
  doctorName: string;
  specialization?: string;
  consultationFee?: number;
  summary: DoctorFinanceSummary;
  bookings: DoctorFinanceBooking[];
  payments: DoctorFinancePayment[];
};

export type PayoutResult = {
  payoutId: number;
  totalAmount: number;
  totalPayments: number;
  status: string;
};

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

export function normalizeDoctorFinanceDetails(body: unknown): DoctorFinanceDetails | null {
  const entity = extractApiEntity<Record<string, unknown>>(body, "doctorId");
  if (!entity) return null;

  const summaryRaw =
    entity.summary && typeof entity.summary === "object"
      ? (entity.summary as Record<string, unknown>)
      : {};

  const bookings = Array.isArray(entity.bookings)
    ? entity.bookings.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          bookingId: asNumber(row.bookingId),
          date: String(row.date ?? ""),
          status: String(row.status ?? ""),
          paymentStatus: String(row.paymentStatus ?? ""),
          amount: asNumber(row.amount),
          platformCut: asNumber(row.platformCut),
          doctorEarning: asNumber(row.doctorEarning),
        };
      })
    : [];

  const payments = Array.isArray(entity.payments)
    ? entity.payments.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          paymentId: asNumber(row.paymentId),
          bookingId: asNumber(row.bookingId),
          amount: asNumber(row.amount),
          status: String(row.status ?? ""),
          transactionId:
            typeof row.transactionId === "string" ? row.transactionId : undefined,
          paidAt: row.paidAt ? String(row.paidAt) : undefined,
          createdAt: row.createdAt ? String(row.createdAt) : undefined,
        };
      })
    : [];

  return {
    doctorId: asNumber(entity.doctorId),
    doctorName: String(entity.doctorName ?? "Doctor"),
    specialization:
      typeof entity.specialization === "string" ? entity.specialization : undefined,
    consultationFee:
      entity.consultationFee != null ? asNumber(entity.consultationFee) : undefined,
    summary: {
      totalBookings: asNumber(summaryRaw.totalBookings),
      totalRevenue: asNumber(summaryRaw.totalRevenue),
      platformCut: asNumber(summaryRaw.platformCut),
      doctorEarning: asNumber(summaryRaw.doctorEarning),
    },
    bookings,
    payments,
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
