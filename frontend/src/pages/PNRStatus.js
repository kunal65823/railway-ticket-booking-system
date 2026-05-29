// src/pages/PNRStatus.js
import React, { useState } from 'react';
import { pnrAPI } from '../services/api';
import { Search, Train, User, Calendar, MapPin, CheckCircle, XCircle, Clock, Download, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

const StatusIcon = ({ status }) => {
  const icons = {
    Confirmed: <CheckCircle size={20} className="text-emerald-400" />,
    Cancelled: <XCircle size={20} className="text-red-400" />,
    Waitlisted: <Clock size={20} className="text-amber-400" />,
    Completed: <CheckCircle size={20} className="text-indigo-400" />,
  };
  return icons[status] || icons.Confirmed;
};

const statusBadge = { Confirmed: 'badge-confirmed', Cancelled: 'badge-cancelled', Waitlisted: 'badge-waitlisted', Completed: 'badge-completed' };

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm text-white font-medium">{value}</span>
  </div>
);

const PNRStatus = () => {
  const [pnr, setPnr] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!pnr.trim()) { toast.error('Please enter a PNR number'); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await pnrAPI.check(pnr.trim().toUpperCase());
      setBooking(res.booking);
    } catch (err) {
      toast.error(err.message || 'PNR not found');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';

  return (
    <div className="pt-24 pb-16 px-4 page-enter min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Search size={28} className="text-indigo-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">PNR Status</h1>
          <p className="text-slate-500">Enter your PNR number to check booking status</p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleCheck} className="glass-strong rounded-2xl p-6 border border-white/10 mb-8">
          <label className="block text-xs text-slate-500 mb-2">PNR Number</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={pnr}
              onChange={e => setPnr(e.target.value.toUpperCase())}
              placeholder="e.g. PNRABC123XY"
              maxLength={14}
              className="flex-1 input-dark rounded-xl px-4 py-3 text-sm font-mono tracking-widest"
            />
            <button type="submit" disabled={loading}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white btn-glow disabled:opacity-50 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Search size={16} />}
              Check
            </button>
          </div>
        </form>

        {/* Result */}
        {loading && (
          <div className="glass rounded-2xl border border-white/10 p-8 text-center">
            <div className="w-10 h-10 mx-auto mb-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Fetching PNR details...</p>
          </div>
        )}

        {!loading && searched && !booking && (
          <div className="glass rounded-2xl border border-white/10 p-10 text-center">
            <XCircle size={40} className="text-red-400 mx-auto mb-3" />
            <h3 className="font-display text-xl text-white mb-1">PNR Not Found</h3>
            <p className="text-slate-500 text-sm">No booking found for PNR: <span className="font-mono text-slate-300">{pnr}</span></p>
          </div>
        )}

        {!loading && booking && (
          <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden animate-fade-in">
            {/* PNR Header */}
            <div className="p-6 border-b border-white/10"
              style={{ background: booking.status === 'Confirmed' ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05))' : booking.status === 'Cancelled' ? 'linear-gradient(135deg, rgba(239,68,68,0.1), transparent)' : 'linear-gradient(135deg, rgba(99,102,241,0.1), transparent)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon status={booking.status} />
                  <div>
                    <p className="text-xs text-slate-500">PNR Number</p>
                    <p className="font-mono text-xl font-bold gradient-text">{booking.pnrNumber}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusBadge[booking.status]}`}>
                  {booking.status}
                </span>
              </div>
            </div>

            {/* Train Info */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Train size={15} className="text-indigo-400" />
                <span className="text-sm font-semibold text-white">{booking.trainSnapshot?.trainName}</span>
                <span className="font-mono text-xs text-slate-500">#{booking.trainSnapshot?.trainNumber}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-3xl font-bold text-white">{booking.trainSnapshot?.departureTime}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-slate-500" />
                    <span className="text-sm text-slate-400">{booking.trainSnapshot?.source}</span>
                  </div>
                </div>
                <div className="flex-1 mx-6 flex flex-col items-center">
                  <div className="w-full flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-indigo-500/50" />
                    <Train size={16} className="text-indigo-400 flex-shrink-0" />
                    <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/50 to-cyan-500/50" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-bold text-white">{booking.trainSnapshot?.arrivalTime}</div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <MapPin size={12} className="text-slate-500" />
                    <span className="text-sm text-slate-400">{booking.trainSnapshot?.destination}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Journey Details */}
            <div className="p-6 border-b border-white/10">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Journey Details</h4>
              <div className="grid grid-cols-2 gap-x-8">
                <InfoRow label="Journey Date" value={formatDate(booking.journeyDate)} />
                <InfoRow label="Seat Class" value={booking.seatClass} />
                <InfoRow label="Booked On" value={formatDate(booking.createdAt)} />
                <InfoRow label="Total Fare" value={`₹${booking.totalFare}`} />
              </div>
            </div>

            {/* Passengers */}
            <div className="p-6 border-b border-white/10">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Passengers ({booking.passengers?.length})
              </h4>
              <div className="space-y-2">
                {booking.passengers?.map((p, i) => (
                  <div key={i} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: `hsl(${i * 60 + 200}, 70%, 50%)` }}>
                        {p.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.age} years · {p.gender}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-indigo-400 font-semibold">{p.seatNumber}</div>
                      <div className="text-xs text-slate-500">Seat</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code */}
            {booking.qrCode && (
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium mb-1">Ticket QR Code</p>
                  <p className="text-xs text-slate-500">Show at the station for verification</p>
                </div>
                <img src={booking.qrCode} alt="QR Code" className="w-20 h-20 rounded-xl border border-white/10" />
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 glass rounded-2xl border border-white/8 p-5">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">💡 Tips</h4>
          <ul className="space-y-1.5">
            {[
              'PNR is a 10-12 character alphanumeric code starting with "PNR"',
              'Status updates every 30 minutes for active journeys',
              'Cancelled bookings show the refund amount processed',
            ].map((tip, i) => (
              <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">→</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PNRStatus;
