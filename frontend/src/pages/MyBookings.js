// src/pages/MyBookings.js
import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Train, Calendar, Users, ChevronDown, ChevronUp, Ticket, Clock, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const statusBadge = { Confirmed: 'badge-confirmed', Cancelled: 'badge-cancelled', Waitlisted: 'badge-waitlisted', Completed: 'badge-completed' };

const SkeletonCard = () => (
  <div className="glass rounded-2xl border border-white/8 p-5">
    <div className="flex justify-between mb-3">
      <div className="space-y-2"><div className="skeleton h-5 w-36 rounded-lg" /><div className="skeleton h-4 w-24 rounded-lg" /></div>
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
    <div className="skeleton h-12 w-full rounded-xl" />
  </div>
);

const BookingCard = ({ booking }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const isPast = new Date(booking.journeyDate) < new Date();

  return (
    <div className={`glass rounded-2xl border transition-all duration-300 overflow-hidden ${expanded ? 'border-indigo-500/30' : 'border-white/8 hover:border-white/20'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Train size={14} className="text-indigo-400" />
              <span className="font-semibold text-white">{booking.trainSnapshot?.trainName || 'Train'}</span>
              <span className="font-mono text-xs text-slate-500">#{booking.trainSnapshot?.trainNumber}</span>
            </div>
            <p className="font-mono text-sm text-indigo-400">{booking.pnrNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            {isPast && booking.status === 'Confirmed' && (
              <span className="badge-completed px-2.5 py-1 rounded-full text-xs font-medium border">Completed</span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge[booking.status]}`}>
              {booking.status}
            </span>
          </div>
        </div>

        {/* Route bar */}
        <div className="flex items-center gap-3 glass rounded-xl px-4 py-3 mb-4">
          <div className="text-center">
            <div className="font-display text-lg font-bold text-white">{booking.trainSnapshot?.departureTime}</div>
            <div className="text-xs text-slate-500">{booking.trainSnapshot?.source}</div>
          </div>
          <div className="flex-1 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
            <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/40 to-cyan-500/40" />
            <Train size={14} className="text-slate-600 flex-shrink-0" />
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/40 to-slate-500/40" />
            <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
          </div>
          <div className="text-center">
            <div className="font-display text-lg font-bold text-white">{booking.trainSnapshot?.arrivalTime}</div>
            <div className="text-xs text-slate-500">{booking.trainSnapshot?.destination}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(booking.journeyDate)}</span>
          <span className="flex items-center gap-1"><Users size={12} /> {booking.passengers?.length} passenger(s)</span>
          <span className="font-semibold text-emerald-400">₹{booking.totalFare}</span>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors">
            Details {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-white/8 p-5 space-y-4 animate-fade-in">
          {/* Passengers */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Passengers</p>
            <div className="space-y-2">
              {booking.passengers?.map((p, i) => (
                <div key={i} className="flex items-center justify-between glass rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: `hsl(${i * 60 + 200}, 70%, 40%)` }}>{p.name?.charAt(0)}</div>
                    <div>
                      <span className="text-sm text-white">{p.name}</span>
                      <span className="text-xs text-slate-500 ml-2">{p.age}y · {p.gender}</span>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-indigo-400">{p.seatNumber}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fare breakdown */}
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-3">Fare Breakdown</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-400"><span>Seat Class</span><span>{booking.seatClass}</span></div>
              <div className="flex justify-between text-slate-400"><span>Base Fare</span><span>₹{booking.baseFare}</span></div>
              <div className="flex justify-between text-slate-400"><span>Tax (5%)</span><span>₹{booking.taxes}</span></div>
              <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10"><span>Total</span><span className="gradient-text">₹{booking.totalFare}</span></div>
            </div>
          </div>

          {/* QR */}
          {booking.qrCode && (
            <div className="flex items-center gap-4">
              <img src={booking.qrCode} alt="QR" className="w-16 h-16 rounded-xl border border-white/10" />
              <div><p className="text-sm text-white font-medium">Ticket QR</p><p className="text-xs text-slate-500">Show at station</p></div>
            </div>
          )}

          {/* Actions */}
          {booking.status === 'Confirmed' && !isPast && (
            <button onClick={() => navigate('/cancel-ticket', { state: { pnr: booking.pnrNumber } })}
              className="w-full py-2.5 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors">
              Cancel This Ticket
            </button>
          )}
          {booking.status === 'Cancelled' && (
            <div className="glass rounded-xl px-4 py-3 border border-amber-500/20">
              <p className="text-xs text-amber-400">Refund of <strong>₹{booking.refundAmount}</strong> processed. Allow 5-7 business days.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (filter !== 'all') params.status = filter;
      const res = await bookingAPI.getMyBookings(params);
      setBookings(res.bookings || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [filter, page]);

  const FILTERS = ['all', 'Confirmed', 'Cancelled', 'Waitlisted'];

  return (
    <div className="pt-24 pb-16 px-4 page-enter">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">My Bookings</h1>
            <p className="text-slate-500 text-sm">{total} total bookings</p>
          </div>
          <button onClick={() => navigate('/search')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white btn-glow flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Train size={15} /> Book New
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <Filter size={14} className="text-slate-500 flex-shrink-0" />
          {FILTERS.map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'glass text-slate-500 border border-white/8'}`}>
              {f === 'all' ? 'All Bookings' : f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map(i => <SkeletonCard key={i} />)
          ) : bookings.length > 0 ? (
            bookings.map(b => <BookingCard key={b._id} booking={b} />)
          ) : (
            <div className="text-center py-20 glass rounded-2xl border border-white/8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
                <Ticket size={28} className="text-slate-500" />
              </div>
              <h3 className="font-display text-xl text-white mb-2">No bookings found</h3>
              <p className="text-slate-500 text-sm mb-6">
                {filter !== 'all' ? `No ${filter.toLowerCase()} bookings` : "You haven't booked any tickets yet"}
              </p>
              <button onClick={() => navigate('/search')}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white btn-glow"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                Search Trains
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 10 && (
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-400 disabled:opacity-40">← Prev</button>
            <span className="px-4 py-2 text-sm text-slate-400">Page {page} of {Math.ceil(total / 10)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 10)}
              className="px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-400 disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
