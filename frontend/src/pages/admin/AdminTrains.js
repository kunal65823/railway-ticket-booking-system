// src/pages/admin/AdminTrains.js
import React, { useState, useEffect } from 'react';
import { trainAPI } from '../../services/api';
import { Train, Plus, Search, Edit, Trash2, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const TRAIN_TYPES = ['Express', 'Superfast', 'Rajdhani', 'Shatabdi', 'Local', 'Duronto'];
const typeClass = { Rajdhani: 'badge-rajdhani', Shatabdi: 'badge-shatabdi', Express: 'badge-express', Superfast: 'badge-superfast', Local: 'badge-local', Duronto: 'badge-duronto' };

const TrainForm = ({ train, onClose, onSave }) => {
  const [form, setForm] = useState(train || {
    trainNumber: '', trainName: '', source: '', destination: '',
    departureTime: '', arrivalTime: '', duration: '',
    totalSeats: 100, availableSeats: 100, trainType: 'Express',
    baseFare: '', distance: '', amenities: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        amenities: typeof form.amenities === 'string' ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : form.amenities,
      };
      if (train?._id) await trainAPI.update(train._id, payload);
      else await trainAPI.create(payload);
      toast.success(train ? 'Train updated!' : 'Train created!');
      onSave();
    } catch (err) {
      toast.error(err.message || 'Failed to save train');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
      <div className="glass-strong border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-white">{train ? 'Edit Train' : 'Add New Train'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {[
            ['Train Number', 'trainNumber', 'text', '12001'],
            ['Train Name', 'trainName', 'text', 'Rajdhani Express'],
            ['Source', 'source', 'text', 'Mumbai'],
            ['Destination', 'destination', 'text', 'Delhi'],
            ['Departure Time', 'departureTime', 'text', '06:00'],
            ['Arrival Time', 'arrivalTime', 'text', '22:00'],
            ['Duration', 'duration', 'text', '16h 00m'],
            ['Base Fare (₹)', 'baseFare', 'number', '1200'],
            ['Total Seats', 'totalSeats', 'number', '200'],
            ['Available Seats', 'availableSeats', 'number', '200'],
            ['Distance (km)', 'distance', 'number', '1388'],
          ].map(([label, field, type, ph]) => (
            <div key={field}>
              <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
              <input type={type} value={form[field] || ''} onChange={set(field)} placeholder={ph}
                className="w-full input-dark rounded-xl px-4 py-2.5 text-sm" />
            </div>
          ))}

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Train Type</label>
            <select value={form.trainType} onChange={set('trainType')} className="w-full input-dark rounded-xl px-4 py-2.5 text-sm">
              {TRAIN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1.5">Amenities (comma-separated)</label>
            <input type="text" value={Array.isArray(form.amenities) ? form.amenities.join(', ') : form.amenities} onChange={set('amenities')}
              placeholder="WiFi, Pantry Car, AC, Charging Points"
              className="w-full input-dark rounded-xl px-4 py-2.5 text-sm" />
          </div>

          <div className="col-span-2 flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl glass border border-white/10 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
              {loading ? 'Saving...' : 'Save Train'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminTrains = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTrain, setEditTrain] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const res = await trainAPI.getAll({ page, limit: 10 });
      setTrains(res.trains || []);
      setTotal(res.total || 0);
    } catch { toast.error('Failed to load trains'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrains(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this train?')) return;
    try {
      await trainAPI.delete(id);
      toast.success('Train deactivated');
      fetchTrains();
    } catch { toast.error('Failed to deactivate'); }
  };

  const filtered = trains.filter(t =>
    t.trainName?.toLowerCase().includes(search.toLowerCase()) ||
    t.trainNumber?.includes(search) ||
    t.source?.toLowerCase().includes(search.toLowerCase())
  );

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
            <h1 className="font-display text-2xl font-bold text-white">Trains</h1>
            <p className="text-slate-500 text-sm">{total} trains in system</p>
          </div>
          <button onClick={() => { setEditTrain(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white btn-glow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Plus size={16} /> Add Train
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-sm">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trains..."
            className="w-full input-dark rounded-xl pl-10 pr-4 py-2.5 text-sm" />
        </div>

        {/* Table */}
        <div className="glass rounded-2xl border border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs text-slate-500">
                  <th className="text-left p-4 font-medium">Train</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Route</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Timing</th>
                  <th className="text-left p-4 font-medium">Seats</th>
                  <th className="text-right p-4 font-medium">Fare</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i}><td colSpan={6} className="p-4"><div className="skeleton h-8 rounded-lg" /></td></tr>
                  ))
                ) : filtered.map(train => (
                  <tr key={train._id} className="hover:bg-white/3 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white text-sm">{train.trainName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs text-slate-500">{train.trainNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${typeClass[train.trainType] || 'badge-express'}`}>{train.trainType}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 hidden sm:table-cell text-xs">
                      {train.source} → {train.destination}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-xs text-slate-400">{train.departureTime} – {train.arrivalTime}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                            style={{ width: `${(train.availableSeats / train.totalSeats) * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{train.availableSeats}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-emerald-400 font-medium">₹{train.baseFare}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditTrain(train); setShowForm(true); }}
                          className="p-2 rounded-lg glass border border-white/10 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(train._id)}
                          className="p-2 rounded-lg glass border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && !filtered.length && (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-600">No trains found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {total > 10 && (
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-400 disabled:opacity-40">← Prev</button>
            <span className="px-4 py-2 text-sm text-slate-400">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 10)}
              className="px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-400 disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>

      {showForm && (
        <TrainForm train={editTrain} onClose={() => { setShowForm(false); setEditTrain(null); }} onSave={() => { setShowForm(false); setEditTrain(null); fetchTrains(); }} />
      )}
    </div>
  );
};

export default AdminTrains;
