"use client";

import { useEffect, useState, useCallback } from "react";
import { XIcon, CurrencyCircleDollar, CheckCircle } from "@phosphor-icons/react";
import type { AdminUser } from "@/types/admin";
import { apiGetCall, apiPostCall } from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { API_CONSTANTS } from "@/constants/staticConstant";
import { getApiErrorMessage } from "@/helper/apiErrors";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type AdminDoctorFinanceModalProps = {
  doctor: AdminUser | null;
  onClose: () => void;
};

type Booking = {
  bookingId: number;
  date: string;
  status: string;
  paymentStatus: string;
  isSettled: boolean;
  amount: number;
  platformCut: number;
  doctorEarning: number;
};

type Payment = {
  paymentId: number;
  bookingId: number;
  amount: number;
  status: string;
  isSettled: boolean;
  transactionId: string;
  paidAt: string;
  createdAt: string;
};

type UnsettledFinanceData = {
  doctorId: number;
  totalRevenue: number;
  totalPlatformCut: number;
  totalDoctorEarning: number;
  bookings: Booking[];
  paymentData: Payment[];
};

type PayoutHistoryItem = {
  payoutId: number;
  totalAmount: string | number;
  status: string;
  paidAt: string;
  createdAt: string;
};

function formatMoney(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 2,
  }).format(num);
}

export default function AdminDoctorFinanceModal({
  doctor,
  onClose,
}: AdminDoctorFinanceModalProps) {
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  
  // State for current finance
  const [financeData, setFinanceData] = useState<UnsettledFinanceData | null>(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeError, setFinanceError] = useState<string | null>(null);
  
  // State for payout history
  const [historyData, setHistoryData] = useState<PayoutHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // State for payout action
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [isConfirmPayoutOpen, setIsConfirmPayoutOpen] = useState(false);

  const loadFinanceData = useCallback(async () => {
    if (!doctor) return;
    setFinanceLoading(true);
    setFinanceError(null);
    try {
      const response = await apiPostCall({
        endpoint: "doctor_finance_details",
        pathParams: { userId: doctor.userId },
        queryParams: { settled: false },
        token: getAccessToken() ?? undefined,
      });

      if (response.status !== API_CONSTANTS.success) {
        setFinanceError(getApiErrorMessage(response.data, "Failed to load finance details.", response.status));
        setFinanceData(null);
        return;
      }
      setFinanceData(response.data?.data || null);
    } catch (err: any) {
      setFinanceError(getApiErrorMessage(err?.response?.data, "Cannot reach backend."));
    } finally {
      setFinanceLoading(false);
    }
  }, [doctor]);

  const loadHistoryData = useCallback(async () => {
    if (!doctor) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await apiGetCall({
        endpoint: "payout_history",
        pathParams: { userId: doctor.userId },
        token: getAccessToken() ?? undefined,
      });

      if (response.status !== API_CONSTANTS.success) {
        setHistoryError(getApiErrorMessage(response.data, "Failed to load payout history.", response.status));
        setHistoryData([]);
        return;
      }
      setHistoryData(response.data?.data || []);
    } catch (err: any) {
      setHistoryError(getApiErrorMessage(err?.response?.data, "Cannot reach backend."));
    } finally {
      setHistoryLoading(false);
    }
  }, [doctor]);

  useEffect(() => {
    if (activeTab === "current") {
      void loadFinanceData();
    } else {
      void loadHistoryData();
    }
  }, [activeTab, loadFinanceData, loadHistoryData]);

  const handleProcessPayout = async () => {
    if (!doctor) return;
    setPayoutLoading(true);
    setPayoutSuccess(null);
    setPayoutError(null);

    try {
      const response = await apiPostCall({
        endpoint: "pay_salary",
        pathParams: { userId: doctor.userId },
        token: getAccessToken() ?? undefined,
      });

      if (response.status >= 200 && response.status < 300) {
        setPayoutSuccess("Payout created successfully.");
        setIsConfirmPayoutOpen(false);
        await loadFinanceData(); // refresh unsettled finance data
      } else {
        setPayoutError(getApiErrorMessage(response.data, "Failed to process payout.", response.status));
      }
    } catch (err: any) {
      setPayoutError(getApiErrorMessage(err?.response?.data, "Error reaching backend while processing payout."));
    } finally {
      setPayoutLoading(false);
    }
  };

  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-zinc-900/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-4xl rounded-xl border border-teal-100 bg-white shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
              <CurrencyCircleDollar size={24} className="text-teal-600" />
              Doctor Finance Management
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {doctor.firstName} {doctor.lastName} · {doctor.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-teal-50"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-zinc-100">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("current")}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "current"
                  ? "border-teal-600 text-teal-800"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Unsettled Finance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "history"
                  ? "border-teal-600 text-teal-800"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Payout History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {activeTab === "current" && (
            <div className="space-y-6">
              {financeLoading && (
                <div className="py-12 text-center text-sm text-zinc-500">Loading finance details…</div>
              )}
              {!financeLoading && financeError && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700">
                  {financeError}
                </div>
              )}
              {!financeLoading && !financeError && financeData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                      <p className="text-sm text-zinc-500 font-medium">Total Revenue</p>
                      <p className="mt-1 text-2xl font-bold text-zinc-800">
                        {formatMoney(financeData.totalRevenue)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                      <p className="text-sm text-rose-600 font-medium">Platform Cut</p>
                      <p className="mt-1 text-2xl font-bold text-rose-800">
                        {formatMoney(financeData.totalPlatformCut)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
                      <p className="text-sm text-teal-700 font-medium">Total Unsettled Earning</p>
                      <p className="mt-1 text-2xl font-bold text-teal-800">
                        {formatMoney(financeData.totalDoctorEarning)}
                      </p>
                    </div>
                  </div>

                  {payoutSuccess && (
                    <div className="rounded-lg bg-green-50 p-4 border border-green-200 text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle size={18} />
                      {payoutSuccess}
                    </div>
                  )}
                  {payoutError && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700">
                      {payoutError}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={payoutLoading || financeData.totalDoctorEarning <= 0}
                      onClick={() => setIsConfirmPayoutOpen(true)}
                      className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {payoutLoading ? "Processing..." : "Process Payout"}
                    </button>
                  </div>

                  {financeData.bookings && financeData.bookings.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-800 mb-3">Unsettled Bookings</h3>
                      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                            <tr>
                              <th className="px-4 py-3 font-medium">ID</th>
                              <th className="px-4 py-3 font-medium">Date</th>
                              <th className="px-4 py-3 font-medium">Amount</th>
                              <th className="px-4 py-3 font-medium">Earning</th>
                              <th className="px-4 py-3 font-medium">Payment Status</th>
                              <th className="px-4 py-3 font-medium">Settled</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {financeData.bookings.map((booking) => (
                              <tr key={booking.bookingId}>
                                <td className="px-4 py-3 text-zinc-500">#{booking.bookingId}</td>
                                <td className="px-4 py-3 text-zinc-800">{new Date(booking.date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-zinc-800">{formatMoney(booking.amount)}</td>
                                <td className="px-4 py-3 text-teal-700 font-medium">{formatMoney(booking.doctorEarning)}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                    booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700'
                                  }`}>
                                    {booking.paymentStatus}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                    booking.isSettled ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {booking.isSettled ? "Yes" : "No"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {(!financeData.bookings || financeData.bookings.length === 0) && (
                    <div className="rounded-xl border border-zinc-100 bg-white p-8 text-center">
                      <p className="text-sm text-zinc-500">No unsettled bookings found.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6">
              {historyLoading && (
                <div className="py-12 text-center text-sm text-zinc-500">Loading payout history…</div>
              )}
              {!historyLoading && historyError && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700">
                  {historyError}
                </div>
              )}
              {!historyLoading && !historyError && historyData.length === 0 && (
                <div className="rounded-xl border border-zinc-100 bg-white p-8 text-center">
                  <p className="text-sm text-zinc-500">No payout history available.</p>
                </div>
              )}
              {!historyLoading && !historyError && historyData.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                      <tr>
                        <th className="px-4 py-3 font-medium">Payout ID</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {historyData.map((payout) => (
                        <tr key={payout.payoutId}>
                          <td className="px-4 py-3 text-zinc-500">#{payout.payoutId}</td>
                          <td className="px-4 py-3 text-zinc-800 font-medium">{formatMoney(payout.totalAmount)}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 capitalize">
                              {payout.status.toLowerCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-600">
                            {new Date(payout.paidAt || payout.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmPayoutOpen}
        title="Confirm Payout"
        message={`Are you sure you want to process the payout of ${financeData ? formatMoney(financeData.totalDoctorEarning) : ""} for Dr. ${doctor.firstName} ${doctor.lastName}?`}
        confirmLabel="Process Payout"
        loading={payoutLoading}
        error={payoutError}
        onConfirm={handleProcessPayout}
        onCancel={() => {
          setIsConfirmPayoutOpen(false);
          setPayoutError(null);
        }}
      />
    </div>
  );
}
