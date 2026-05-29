// src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, Train, Ticket, IndianRupee, TrendingUp, TrendingDown,
  ArrowRight, AlertCircle, CheckCircle, XCircle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CLASS_COLORS = { General: '#6366f1', Sleeper: '#06b6d4', '3AC': '#8b5cf6', '2AC': '#f59e0b', '1AC': '#f43f5e' };
const PIE_COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

const StatCard = ({ icon: Icon, label, value, sub, trend, color }) => (
  <div className="glass rounded-2xl border border-white/8 p-5 hover:border-white/20 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="font-display text-2xl font-bold text-white mb-0.5">{value}</div>
    <div className="text-xs text-slate-500">{label}</div>
    {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong border border-white/10 rounded-xl p-3 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.name === 'revenue' ? '₹' : ''}{p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
};

const AdminSidebar = () => (
  <div className="fixed left-0 top-16 h-full w-56 glass border-r border-white/8 p-4 hidden lg:block">
    <nav className="space-y-1 mt-4">
      {[
        { to: '/admin', label: 'Dashboard', icon: '📊' },
        { to: '/admin/trains', label: 'Trains', icon: '🚂' },
        { to: '/admin/users', label: 'Users', icon: '👥' },
        { to: '/admin/bookings', label: 'Bookings', icon: '🎫' },
      ].map(({ to, label, icon }) => (
        <Link key={to} to={to}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          <span>{icon}</span> {label}
        </Link>
      ))}
    </nav>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(res => setData(res))
      .catch(err => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = data?.monthlyData?.map(m => ({
    month: MONTHS[(m._id?.month || 1) - 1],
    bookings: m.bookings,
    revenue: m.revenue,
  })) || [];

  const pieData = data?.bookingsByClass?.map(c => ({
    name: c._id,
    value: c.count,
    revenue: c.revenue,
  })) || [];

  const statusBadge = (status) => ({
    Confirmed: <span className="badge-confirmed px-2 py-0.5 rounded-full text-xs border">Confirmed</span>,
    Cancelled: <span className="badge-cancelled px-2 py-0.5 rounded-full text-xs border">Cancelled</span>,
    Waitlisted: <span className="badge-waitlisted px-2 py-0.5 rounded-full text-xs border">Waitlisted</span>,
  }[status] || null);

  if (loading) return (
    <div className="lg:pl-56 pt-16 p-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="lg:pl-56 pt-16 min-h-screen">
      <AdminSidebar />
      <div className="p-4 sm:p-6 lg:p-8 page-enter">
        {/* Mobile nav */}
        <div className="flex gap-2 mb-6 lg:hidden overflow-x-auto pb-1">
          {[['📊','Dashboard','/admin'],['🚂','Trains','/admin/trains'],['👥','Users','/admin/users'],['🎫','Bookings','/admin/bookings']].map(([icon,label,to]) => (
            <Link key={to} to={to} className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-white/10 text-xs text-slate-400 whitespace-nowrap">
              {icon} {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm">System overview and analytics</p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label="Total Users" value={data?.stats?.totalUsers?.toLocaleString() || '0'}
            color="bg-gradient-to-br from-indigo-500 to-violet-600" trend={12} />
          <StatCard icon={Train} label="Active Trains" value={data?.stats?.totalTrains || '0'}
            color="bg-gradient-to-br from-cyan-500 to-blue-600" />
          <StatCard icon={Ticket} label="Total Bookings" value={data?.stats?.totalBookings?.toLocaleString() || '0'}
            color="bg-gradient-to-br from-emerald-500 to-teal-600" trend={8}
            sub={`${data?.stats?.confirmedBookings} confirmed`} />
          <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(data?.stats?.totalRevenue / 1000)?.toFixed(0)}K`}
            color="bg-gradient-to-br from-amber-500 to-orange-600" trend={15} />
        </div>

        {/* Sub-stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Confirmed', val: data?.stats?.confirmedBookings, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Cancelled', val: data?.stats?.cancelledBookings, icon: XCircle, color: 'text-red-400' },
            { label: 'Cancel Rate', val: `${data?.stats?.cancellationRate}%`, icon: AlertCircle, color: 'text-amber-400' },
          ].map(({ label, val, icon: Icon, color }) => (
            <div key={label} className="glass rounded-xl border border-white/8 p-4 flex items-center gap-3">
              <Icon size={18} className={color} />
              <div>
                <div className="font-bold text-white">{val}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Monthly Chart */}
          <div className="lg:col-span-2 glass rounded-2xl border border-white/8 p-5">
            <h3 className="font-semibold text-white mb-5 text-sm">Monthly Bookings & Revenue</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="bookings" stroke="#6366f1" fill="url(#bookingsGrad)" strokeWidth={2} name="bookings" />
                <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fill="url(#revenueGrad)" strokeWidth={2} name="revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Class Distribution */}
          <div className="glass rounded-2xl border border-white/8 p-5">
            <h3 className="font-semibold text-white mb-5 text-sm">Bookings by Class</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(val) => [val, 'Bookings']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-3">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-400">{d.name}</span>
                      </div>
                      <span className="text-white font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-600 text-sm">No data yet</div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="glass rounded-2xl border border-white/8 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white text-sm">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-white/5">
                  <th className="text-left pb-3 font-medium">PNR</th>
                  <th className="text-left pb-3 font-medium hidden sm:table-cell">Passenger</th>
                  <th className="text-left pb-3 font-medium hidden md:table-cell">Train</th>
                  <th className="text-right pb-3 font-medium">Fare</th>
                  <th className="text-right pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.recentBookings?.slice(0, 8).map(b => (
                  <tr key={b._id} className="hover:bg-white/3 transition-colors">
                    <td className="py-3 font-mono text-xs text-indigo-400">{b.pnrNumber}</td>
                    <td className="py-3 text-slate-300 hidden sm:table-cell">{b.user?.name || 'N/A'}</td>
                    <td className="py-3 text-slate-400 hidden md:table-cell text-xs">{b.trainSnapshot?.trainName || 'N/A'}</td>
                    <td className="py-3 text-right text-emerald-400 font-medium">₹{b.totalFare}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${
                        b.status === 'Confirmed' ? 'badge-confirmed' :
                        b.status === 'Cancelled' ? 'badge-cancelled' : 'badge-waitlisted'
                      }`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
                {!data?.recentBookings?.length && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-600 text-sm">No bookings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
