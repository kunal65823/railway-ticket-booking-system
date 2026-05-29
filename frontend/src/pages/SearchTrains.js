// src/pages/SearchTrains.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { trainAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search, Train, Clock, Users, ArrowRight, Filter,
  Wifi, Coffee, Zap, Star, AlertCircle, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Goa', 'Amritsar', 'Kolkata', 'Jaipur'];

const classColors = {
  General: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  Sleeper: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  '3AC': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  '2AC': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  '1AC': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const trainTypeClass = {
  Rajdhani: 'badge-rajdhani', Shatabdi: 'badge-shatabdi',
  Express: 'badge-express', Superfast: 'badge-superfast',
  Local: 'badge-local', Duronto: 'badge-duronto',
};

const SkeletonCard = () => (
  <div className="glass rounded-2xl p-6 border border-white/8">
    <div className="flex justify-between mb-4">
      <div className="space-y-2">
        <div className="skeleton h-5 w-40 rounded-lg" />
        <div className="skeleton h-4 w-28 rounded-lg" />
      </div>
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
    <div className="flex items-center gap-4 mb-4">
      <div className="skeleton h-8 w-20 rounded-lg" />
      <div className="skeleton h-4 w-24 rounded-lg" />
      <div className="skeleton h-8 w-20 rounded-lg" />
    </div>
    <div className="flex gap-2">
      {[1,2,3,4].map(i => <div key={i} className="skeleton h-8 w-16 rounded-lg" />)}
    </div>
  </div>
);

const TrainCard = ({ train, onBook }) => {
  const [expanded, setExpanded] = useState(false);
  const { isAuthenticated } = useAuth();

  const amenityIcons = { WiFi: Wifi, 'Pantry Car': Coffee, AC: Zap };

  return (
    <div className="glass rounded-2xl border border-white/8 hover:border-indigo-500/20 transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-xs text-slate-500">{train.trainNumber}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${trainTypeClass[train.trainType] || 'badge-express'}`}>
                {train.trainType}
              </span>
            </div>
            <h3 className="font-display font-semibold text-xl text-white">{train.trainName}</h3>
          </div>

          <div className="flex items-center gap-1.5">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-sm text-amber-400 font-medium">{train.rating || 4.0}</span>
          </div>
        </div>

        {/* Route & Time */}
        <div className="flex items-center gap-4 mb-5">
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-white">{train.departureTime}</div>
            <div className="text-xs text-slate-500 mt-0.5">{train.source}</div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="text-xs text-slate-600 mb-1">{train.duration || 'Duration'}</div>
            <div className="w-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
              <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/50 via-white/10 to-cyan-500/50" />
              <Train size={16} className="text-indigo-400 flex-shrink-0" />
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 via-white/10 to-cyan-500/50" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
            </div>
            <div className="text-xs text-slate-600 mt-1">{train.distance ? `${train.distance} km` : ''}</div>
          </div>

          <div className="text-center">
            <div className="font-display text-2xl font-bold text-white">{train.arrivalTime}</div>
            <div className="text-xs text-slate-500 mt-0.5">{train.destination}</div>
          </div>
        </div>

        {/* Availability indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${train.availableSeats > 20 ? 'bg-emerald-400' : train.availableSeats > 5 ? 'bg-amber-400' : 'bg-red-400'}`} />
          <span className="text-xs text-slate-500">
            {train.availableSeats} seats available
          </span>
          {train.amenities?.slice(0, 3).map(a => (
            <span key={a} className="text-xs text-slate-600 px-2 py-0.5 rounded-full border border-white/8">{a}</span>
          ))}
        </div>

        {/* Class selection */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(train.fares || {}).map(([cls, fare]) => (
            <button key={cls}
              onClick={() => isAuthenticated ? onBook(train, cls) : toast.error('Please login to book tickets')}
              className={`flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-medium transition-all hover:scale-105 ${classColors[cls] || classColors.Sleeper}`}>
              <span>{cls}</span>
              <span className="font-bold text-sm mt-0.5">₹{fare}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2 border-t border-white/5 text-xs text-slate-600 hover:text-slate-400 transition-colors">
        {expanded ? 'Less info' : 'More details'}
        <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-6 pb-4 grid grid-cols-2 gap-3">
          {[
            ['Days of Operation', train.daysOfOperation?.join(', ') || 'Daily'],
            ['Total Seats', train.totalSeats],
            ['Train #', train.trainNumber],
            ['Distance', train.distance ? `${train.distance} km` : 'N/A'],
          ].map(([label, val]) => (
            <div key={label} className="glass rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-0.5">{label}</div>
              <div className="text-sm text-slate-300 font-medium">{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchTrains = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [source, setSource] = useState(searchParams.get('source') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [sortBy, setSortBy] = useState('departure');

  useEffect(() => {
    if (searchParams.get('source') && searchParams.get('destination')) {
      handleSearch();
    }
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!source || !destination) { toast.error('Please select source and destination'); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await trainAPI.search({ source, destination, date });
      setTrains(res.trains || []);
      if (!res.trains?.length) toast.error('No trains found for this route');
    } catch (err) {
      toast.error(err.message || 'Search failed');
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (train, seatClass) => {
    navigate(`/book/${train._id}`, { state: { train, seatClass, date } });
  };

  const sortedTrains = [...trains].sort((a, b) => {
    if (sortBy === 'departure') return a.departureTime.localeCompare(b.departureTime);
    if (sortBy === 'fare') return (a.fares?.General || 0) - (b.fares?.General || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className="pt-24 pb-16 px-4 page-enter">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1">Search Trains</h1>
          <p className="text-slate-500 text-sm">Find trains for your journey</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="glass-strong rounded-2xl p-5 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1.5">From</label>
              <select value={source} onChange={e => setSource(e.target.value)} className="w-full input-dark rounded-xl px-4 py-3 text-sm">
                <option value="">Select source</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1.5">To</label>
              <select value={destination} onChange={e => setDestination(e.target.value)} className="w-full input-dark rounded-xl px-4 py-3 text-sm">
                <option value="">Select destination</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1.5">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full input-dark rounded-xl px-4 py-3 text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white btn-glow flex items-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Search size={16} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Sort/Filter bar */}
        {searched && !loading && trains.length > 0 && (
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <p className="text-slate-400 text-sm"><span className="text-white font-semibold">{trains.length}</span> trains found</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sort by:</span>
              {['departure', 'fare', 'rating'].map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === s ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'glass text-slate-500 border border-white/8'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map(i => <SkeletonCard key={i} />)
          ) : trains.length > 0 ? (
            sortedTrains.map(train => (
              <TrainCard key={train._id} train={train} onBook={handleBook} />
            ))
          ) : searched && (
            <div className="text-center py-20 glass rounded-2xl border border-white/8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
                <AlertCircle size={28} className="text-slate-500" />
              </div>
              <h3 className="font-display text-xl text-white mb-2">No trains found</h3>
              <p className="text-slate-500 text-sm">Try a different route or date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchTrains;
