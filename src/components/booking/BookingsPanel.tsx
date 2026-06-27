'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, Video, Search, SlidersHorizontal, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { apiGetCall } from '@/helper/apiService';

// ─── Types ───────────────────────────────────────────────────────────────
interface Booking {
  id: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  bookingDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  meetLink?: string | null;
  patient: { id: number; name: string };
  doctor: { id: number; name: string; specialization?: string };
}

interface BookingsPanelProps {
  doctorId?: number;
}

const HISTORY_PAGE_SIZE = 4;

// ─── Helpers ─────────────────────────────────────────────────────────────
const formatDay = (dateStr: string) => new Date(dateStr).getDate();
const formatMonth = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (time: string) => {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
};

const getDuration = (start: string, end: string) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
};

const normalizeStatus = (status: string) => status.toUpperCase();

const STATUS_META: Record<string, { dot: string; text: string; label: string; cardBorder: string }> = {
  CONFIRMED: { dot: 'bg-teal-600', text: 'text-teal-700', label: 'CONFIRMED', cardBorder: 'border-teal-300' },
  PENDING: { dot: 'bg-amber-500', text: 'text-amber-600', label: 'PENDING APPROVAL', cardBorder: 'border-slate-200' },
  COMPLETED: { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'Completed', cardBorder: 'border-slate-200' },
  CANCELLED: { dot: 'bg-rose-500', text: 'text-rose-600', label: 'Cancelled', cardBorder: 'border-slate-200' },
};

const getStatusMeta = (status: string) =>
  STATUS_META[normalizeStatus(status)] || { dot: 'bg-slate-400', text: 'text-slate-600', label: status, cardBorder: 'border-slate-200' };

const StatusDot = ({ status }: { status: string }) => {
  const meta = getStatusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

const AVATAR_PALETTE = [
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-slate-200 text-slate-700',
  'bg-rose-100 text-rose-700',
];

const getInitials = (name: string) => {
  const clean = name.replace(/^dr\.?\s*/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
};

const getAvatarColor = (id: number) => AVATAR_PALETTE[id % AVATAR_PALETTE.length];

const Avatar = ({ id, name, size = 'md' }: { id: number; name: string; size?: 'sm' | 'md' }) => {
  const dims = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-11 h-11 text-sm';
  return (
    <div className={`${dims} rounded-full flex items-center justify-center font-semibold ${getAvatarColor(id)} shrink-0`}>
      {getInitials(name)}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────
export default function BookingsPanel({ doctorId }: BookingsPanelProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyPage, setHistoryPage] = useState(1);

  const fetchBookings = async () => {
    try {
      const response = await apiGetCall({ endpoint: 'bookings' });
      if (response.status === 200 && response.data?.success) {
        const data = Array.isArray(response.data.message) ? response.data.message : [];
        setBookings(data);
      } else {
        setError('Failed to load appointments');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ─── Schedule Now handler ─────────────────────────────────────────
  const handleScheduleClick = () => {
    router.push('/patient/doctors');
  };

  // ─── Derived data ───────────────────────────────────────────────────
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYear = now.getFullYear();

  const totalVisitsThisYear = bookings.filter(
    (b) => new Date(b.bookingDate).getFullYear() === thisYear
  ).length;

  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => {
          const status = normalizeStatus(b.status);
          return status !== 'COMPLETED' && status !== 'CANCELLED' && new Date(b.bookingDate) >= startOfToday;
        })
        .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()),
    [bookings]
  );

  const nextVisit = upcoming.length > 0 ? upcoming[0] : null;
  const pendingTests = bookings.filter((b) => normalizeStatus(b.status) === 'PENDING').length;

  const history = useMemo(
    () =>
      bookings
        .filter((b) => {
          const status = normalizeStatus(b.status);
          return status === 'COMPLETED' || status === 'CANCELLED' || new Date(b.bookingDate) < startOfToday;
        })
        .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()),
    [bookings]
  );

  const filteredHistory = useMemo(() => {
    const query = historySearch.toLowerCase();
    return history.filter(
      (b) =>
        b.doctor.name.toLowerCase().includes(query) ||
        (b.doctor.specialization || '').toLowerCase().includes(query)
    );
  }, [history, historySearch]);

  const totalHistoryPages = Math.max(1, Math.ceil(filteredHistory.length / HISTORY_PAGE_SIZE));
  const currentPage = Math.min(historyPage, totalHistoryPages);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * HISTORY_PAGE_SIZE,
    currentPage * HISTORY_PAGE_SIZE
  );

  if (loading) return <div className="p-6 text-slate-400">Loading appointments…</div>;
  if (error) return <div className="p-6 text-rose-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-50">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">My Appointments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your upcoming visits and healthcare history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleScheduleClick}
            className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-full pl-3.5 pr-4 py-2.5 transition"
          >
            <Plus size={16} />
            Schedule Now
          </button>
        </div>
      </div>

      {/* ── Upcoming Appointments ───────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Upcoming Appointments</h2>
          <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
            {upcoming.length} SCHEDULED
          </span>
        </div>

        {upcoming.length === 0 ? (
          <p className="text-slate-400 text-sm">No upcoming appointments.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((booking) => {
              const duration = getDuration(booking.startTime, booking.endTime);
              const status = normalizeStatus(booking.status);
              const meta = getStatusMeta(status);
              const isConfirmed = status === 'CONFIRMED';
              const isTelehealth = !!booking.meetLink;

              return (
                <div
                  key={booking.id}
                  className={`bg-white border-2 ${meta.cardBorder} rounded-2xl p-5 shadow-sm`}
                >
                  {/* Doctor + date badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar id={booking.doctor.id} name={booking.doctor.name} />
                      <div>
                        <h3 className="font-semibold text-slate-800 leading-tight">
                          {booking.doctor.name || `Dr. ID ${booking.doctor.id}`}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {booking.doctor.specialization || 'General Medicine'}
                        </p>
                        <div className="mt-1">
                          <StatusDot status={booking.status} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-100 rounded-xl px-3 py-2 text-center min-w-[56px]">
                      <p className="text-xl font-bold text-slate-800 leading-none">
                        {formatDay(booking.bookingDate)}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 tracking-wide mt-0.5">
                        {formatMonth(booking.bookingDate)}
                      </p>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="mt-4 flex flex-wrap gap-6 text-sm">
                    {isTelehealth ? (
                      <>
                        <div>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
                            <Video size={13} /> Type
                          </span>
                          <p className="text-slate-700 mt-0.5">Telehealth Call</p>
                        </div>
                        <div>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
                            <Clock size={13} /> Time
                          </span>
                          <p className="text-slate-700 mt-0.5">
                            {formatTime(booking.startTime)} ({duration} min)
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
                            <Clock size={13} /> Time
                          </span>
                          <p className="text-slate-700 mt-0.5">
                            {formatTime(booking.startTime)} ({duration} min)
                          </p>
                        </div>
                        <div>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
                            <MapPin size={13} /> Location
                          </span>
                          <p className="text-slate-700 mt-0.5">Suite 402, Main Wing</p>
                        </div>
                      </>
                    )}
                  </div>

                  {booking.notes && (
                    <p className="mt-3 text-sm text-slate-500">
                      <span className="font-medium text-slate-400">Notes: </span>
                      {booking.notes}
                    </p>
                  )}

                  {/* ── Actions ─────────────────────────────────── */}
                  <div className="mt-4 flex gap-3">
                    {isConfirmed ? (
                      // ✅ Confirmed: only one button – "View Appointment"
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="w-full bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg py-2 transition"
                      >
                        View Appointment
                      </button>
                    ) : (
                      // ❌ Non‑confirmed: two buttons – Cancel Request + Details
                      <>
                        <button className="flex-1 border border-teal-700 text-teal-700 text-sm font-medium rounded-lg py-2 hover:bg-teal-50 transition">
                          Cancel Request
                        </button>
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="flex-1 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg py-2 bg-slate-50 hover:bg-slate-100 transition"
                        >
                          Details
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Appointment History ─────────────────────────────────── */}
      <section className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Appointment History</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  setHistoryPage(1);
                }}
                className="border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <button className="border border-slate-200 rounded-lg p-2.5 bg-white hover:bg-slate-50">
              <SlidersHorizontal size={15} className="text-slate-500" />
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <p className="text-slate-400 text-sm">No history found.</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedHistory.map((booking) => {
                  const status = normalizeStatus(booking.status);
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar id={booking.doctor.id} name={booking.doctor.name} size="sm" />
                          <span className="text-sm font-medium text-slate-800">
                            {booking.doctor.name || `Dr. ${booking.doctor.id}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(booking.bookingDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {booking.doctor.specialization || 'General'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusDot status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {status === 'COMPLETED' && (
                          <button className="text-teal-700 font-medium hover:underline">View Report</button>
                        )}
                        {status === 'CANCELLED' && <span className="text-slate-400">See Reason</span>}
                        {status !== 'COMPLETED' && status !== 'CANCELLED' && <span className="text-slate-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
          <span>
            Showing {paginatedHistory.length} of {filteredHistory.length} appointments
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border border-slate-200 rounded-lg p-1.5 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} className="text-slate-500" />
            </button>
            <button
              onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
              disabled={currentPage === totalHistoryPages}
              className="border border-slate-200 rounded-lg p-1.5 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats footer ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-teal-50 rounded-2xl p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Visits</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {totalVisitsThisYear} <span className="text-sm font-normal text-slate-400">this year</span>
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Next Visit</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {nextVisit ? formatDate(nextVisit.bookingDate) : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Pending Tests</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {pendingTests} <span className="text-sm font-normal text-slate-400">results</span>
          </p>
        </div>
      </div>

      {/* ── Appointment Detail Modal ───────────────────────────── */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-teal-900">Appointment Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">Doctor</p>
                <p className="text-lg font-semibold text-slate-800">
                  {selectedBooking.doctor.name}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedBooking.doctor.specialization || 'General Medicine'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">Status</p>
                <StatusDot status={selectedBooking.status} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">Date & Time</p>
                <p className="text-slate-700">
                  {formatDate(selectedBooking.bookingDate)} &bull;{' '}
                  {formatTime(selectedBooking.startTime)} – {formatTime(selectedBooking.endTime)}
                  <span className="text-sm text-slate-400 ml-1">
                    ({getDuration(selectedBooking.startTime, selectedBooking.endTime)} min)
                  </span>
                </p>
              </div>

              {selectedBooking.notes && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Notes</p>
                  <p className="text-slate-700">{selectedBooking.notes}</p>
                </div>
              )}

              {selectedBooking.meetLink && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Meet Link</p>
                  <a
                    href={selectedBooking.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-700 underline"
                  >
                    Join Call
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Patient</p>
                  <p className="text-slate-700">{selectedBooking.patient.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Booking ID</p>
                  <p className="text-slate-700">#{selectedBooking.id}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-teal-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}