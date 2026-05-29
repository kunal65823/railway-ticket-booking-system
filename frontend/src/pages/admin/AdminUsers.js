// src/pages/admin/AdminUsers.js
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import { Search, UserCheck, UserX, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [toggling, setToggling] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ page, search: search || undefined });
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchUsers(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const toggleUser = async (id) => {
    setToggling(id);
    try {
      const res = await adminAPI.toggleUserStatus(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.user.isActive } : u));
      toast.success(res.message);
    } catch { toast.error('Failed to update user'); }
    finally { setToggling(null); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

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
            <h1 className="font-display text-2xl font-bold text-white">Users</h1>
            <p className="text-slate-500 text-sm">{total} registered users</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-sm">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full input-dark rounded-xl pl-10 pr-4 py-2.5 text-sm" />
        </div>

        {/* Table */}
        <div className="glass rounded-2xl border border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs text-slate-500">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Phone</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Joined</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-right p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i}><td colSpan={5} className="p-4"><div className="skeleton h-8 rounded-lg" /></td></tr>
                  ))
                ) : users.map(user => (
                  <tr key={user._id} className="hover:bg-white/3 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{ background: `hsl(${user.name?.charCodeAt(0) * 20 % 360}, 60%, 35%)` }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 hidden md:table-cell text-xs">{user.phone || '—'}</td>
                    <td className="p-4 text-slate-400 hidden sm:table-cell text-xs">{formatDate(user.createdAt)}</td>
                    <td className="p-4">
                      {user.role === 'admin' ? (
                        <span className="flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full w-fit">
                          <Shield size={10} /> Admin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-slate-400 glass border border-white/10 px-2 py-0.5 rounded-full w-fit">
                          <User size={10} /> User
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {user.role !== 'admin' && (
                        <button onClick={() => toggleUser(user._id)} disabled={toggling === user._id}
                          className={`flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 ${
                            user.isActive
                              ? 'text-red-400 border-red-500/20 hover:bg-red-500/10'
                              : 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
                          }`}>
                          {toggling === user._id ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : user.isActive ? (
                            <><UserX size={12} /> Deactivate</>
                          ) : (
                            <><UserCheck size={12} /> Activate</>
                          )}
                        </button>
                      )}
                      {user.role === 'admin' && <span className="text-xs text-slate-600">Protected</span>}
                    </td>
                  </tr>
                ))}
                {!loading && !users.length && (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-600">No users found</td></tr>
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

export default AdminUsers;
