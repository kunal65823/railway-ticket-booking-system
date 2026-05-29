// src/pages/admin/AdminBookings.js
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import { Search, Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const statusBadge = { Confirmed: 'badge-confirmed', Cancelled: 'badge-cancelled', Waitlisted: 'badge-waitlisted', Completed: 'badge-completed' };

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getBookings({ page, status: statusFilter || undefined, search: search || undefined });
      setBookings(res.bookings || []);
      setTotal(res.total || 0);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [page, statusFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchBookings(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleExport = () => {
    const csv = [
      ['PNR', 'Passenger', 'Email', 'Train', 'Route', 'Journey Date', 'Class', 'Fare', 'Status'],
      ...bookings.map(b => [
        b.pnrNumber,
        b.user?.name || 'N/A',
        b.user?.email || 'N/A',
        b.trainSnapshot?.trainName || 'N/A',
        `${b.trainSnapshot?.source} → ${b.trainSnapshot?.destination}`,
        formatDate(b.journeyDate),
        b.seatClass,
        b.totalFare,
        b.status,
      ])
    ].map(r => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Exported successfully!');
  };

  return (
    <div className="lg:pl-56 pt-16 min-h-screen">
      <div className="p-4 sm:p-6 lg:p-8 page-enter">
        {/* Mobile nav */}
        <div className="flex gap-2 mb-6 lg:hidden overflow-x-auto pb-1">
          {[['📊','Dashboard','/admin'],['🚂','Trains','/admin/trains'],['👥','Users','/admin/users'],['🎫','Bookings','/admin/bookings']].map(([icon,label,to]) => (
            <Link key={to} to={to} className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-white/10 text-xs text-slate-400 whitespace-nowrap">{icon} {label}</Link>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Bookings</h1>
            <p className="text-slate-500 text-sm">{total} total bookings</p>
          </div>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/10 text-sm text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all">
            <Download size={15} /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search PNR..."
              className="input-dark rounded-xl pl-10 pr-4 py-2.5 text-sm w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            {['', 'Confirmed', 'Cancelled', 'Waitlisted'].map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${statusFilter === s ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'glass text-slate-500 border-white/8'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass rounded-2xl border border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs text-slate-500">
                  <th className="text-left p-4 font-medium">PNR</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Passenger</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Train</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Journey</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Class</th>
                  <th className="text-right p-4 font-medium">Fare</th>
                  <th className="text-right p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  [1,2,3,4,5,6].map(i => (
                    <tr key={i}><td colSpan={7} className="p-4"><div className="skeleton h-8 rounded-lg" /></td></tr>
                  ))
                ) : bookings.map(b => (
                  <tr key={b._id} className="hover:bg-white/3 transition-colors">
                    <td className="p-4 font-mono text-xs text-indigo-400">{b.pnrNumber}</td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="text-sm text-white">{b.user?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{b.user?.email || ''}</div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="text-xs text-slate-400">{b.trainSnapshot?.trainName}</div>
                      <div className="text-xs text-slate-600">{b.trainSnapshot?.source} → {b.trainSnapshot?.destination}</div>
                    </td>
                    <td className="p-4 text-xs text-slate-400 hidden md:table-cell">{formatDate(b.journeyDate)}</td>
                    <td className="p-4 text-xs text-slate-400 hidden md:table-cell">{b.seatClass}</td>
                    <td className="p-4 text-right text-emerald-400 font-medium">₹{b.totalFare}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${statusBadge[b.status] || 'badge-confirmed'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && !bookings.length && (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-600">No bookings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-400 disabled:opacity-40">← Prev</button>
            <span className="px-4 py-2 text-sm text-slate-400">Page {page} of {Math.ceil(total / 20)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}
              className="px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-400 disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
