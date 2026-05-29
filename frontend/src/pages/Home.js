// src/pages/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainAPI } from '../services/api';
import {
  Search, ArrowRight, Zap, Shield, Clock, Star,
  TrendingUp, Train, Users, Map, ChevronRight, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Animated Counter ─────────────────────────────────────────────────
const Counter = ({ end, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const duration = 2000;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const prog = Math.min((timestamp - start) / duration, 1);
          setCount(Math.floor(prog * end));
          if (prog < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl font-extrabold gradient-text mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
};

// ─── Train Search Widget ───────────────────────────────────────────────
const SearchWidget = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Goa', 'Amritsar', 'Kolkata', 'Jaipur'];

  const handleSwap = () => { setFrom(to); setTo(from); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!from || !to) { toast.error('Please select source and destination'); return; }
    if (from.toLowerCase() === to.toLowerCase()) { toast.error('Source and destination cannot be the same'); return; }
    navigate(`/search?source=${from}&destination=${to}&date=${date}`);
  };

  return (
    <form onSubmit={handleSearch} className="glass-strong rounded-3xl p-6 border border-white/10 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-indigo-400" />
        <span className="text-sm text-slate-400 font-medium">Find your perfect train</span>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        {/* From */}
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1.5 ml-1">From</label>
          <select value={from} onChange={e => setFrom(e.target.value)}
            className="w-full input-dark rounded-xl px-4 py-3 text-sm font-medium">
            <option value="">Select city</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Swap button */}
        <div className="flex items-end pb-0.5 justify-center">
          <button type="button" onClick={handleSwap}
            className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all glass">
            <ArrowRight size={16} />
          </button>
        </div>

        {/* To */}
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1.5 ml-1">To</label>
          <select value={to} onChange={e => setTo(e.target.value)}
            className="w-full input-dark rounded-xl px-4 py-3 text-sm font-medium">
            <option value="">Select city</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Date */}
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1.5 ml-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full input-dark rounded-xl px-4 py-3 text-sm" />
        </div>

        {/* Search btn */}
        <div className="flex items-end">
          <button type="submit"
            className="w-full md:w-auto px-8 py-3 rounded-xl font-semibold text-sm text-white btn-glow transition-all hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Search size={16} />
            Search Trains
          </button>
        </div>
      </div>
    </form>
  );
};

// ─── Train Card (Popular Route) ───────────────────────────────────────
const RouteCard = ({ source, destination, count, avgFare }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/search?source=${source}&destination=${destination}`)}
      className="glass rounded-2xl p-5 border border-white/8 hover:border-indigo-500/30 transition-all duration-300 hover:scale-105 text-left group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-semibold text-white">{source}</span>
        </div>
        <Train size={16} className="text-indigo-400" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{destination}</span>
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{count} trains available</span>
        <div className="flex items-center gap-1 text-emerald-400">
          <span className="text-sm font-bold">₹{Math.round(avgFare || 800)}</span>
          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </button>
  );
};

// ─── Feature Card ─────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, desc, color }) => (
  <div className="glass rounded-2xl p-6 border border-white/8 hover:border-white/20 transition-all duration-300 group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <h3 className="font-display font-semibold text-lg text-white mb-2 group-hover:text-indigo-300 transition-colors">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

// ─── Home Page ─────────────────────────────────────────────────────────
const Home = () => {
  const [routes, setRoutes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    trainAPI.getPopularRoutes()
      .then(res => setRoutes(res.routes || []))
      .catch(() => {});
  }, []);

  return (
    <div className="page-enter">
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 px-4">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />

        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass border border-indigo-500/30 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-indigo-300 font-medium">Now with AI-powered journey planner</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Travel Smarter.<br />
              <span className="gradient-text">Journey Better.</span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Book train tickets across India in seconds. Real-time availability,
              instant PNR tracking, and seamless cancellations — all in one place.
            </p>

            {/* Search widget */}
            <SearchWidget />

            {/* Quick actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {[
                { label: 'Check PNR Status', to: '/pnr-status', icon: Search },
                { label: 'My Bookings', to: '/my-bookings', icon: Ticket },
                { label: 'Cancel Ticket', to: '/cancel-ticket', icon: Clock },
              ].map(({ label, to, icon: Icon }) => (
                <button key={to} onClick={() => navigate(to)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all">
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong rounded-3xl p-10 border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Counter end={12500} label="Happy Passengers" suffix="+" />
              <Counter end={450} label="Train Routes" suffix="+" />
              <Counter end={98} label="On-Time Rate" suffix="%" />
              <Counter end={24} label="Support Hours" suffix="/7" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Routes ── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-white mb-2">Popular Routes</h2>
              <p className="text-slate-500 text-sm">Most booked corridors across India</p>
            </div>
            <button onClick={() => navigate('/search')}
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.length > 0 ? routes.map((r, i) => (
              <RouteCard key={i} source={r._id?.source} destination={r._id?.destination}
                count={r.count} avgFare={r.avgFare} />
            )) : (
              // Placeholder cards while loading
              [
                ['Mumbai', 'Delhi'], ['Delhi', 'Mumbai'], ['Pune', 'Bangalore'],
                ['Hyderabad', 'Chennai'], ['Mumbai', 'Goa'], ['Bangalore', 'Delhi'],
              ].map(([src, dst], i) => (
                <RouteCard key={i} source={src} destination={dst} count={2} avgFare={1200} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Travel
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              A complete railway management experience built for the modern traveler
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={Zap} color="bg-gradient-to-br from-indigo-500 to-violet-600"
              title="Instant Booking" desc="Book your ticket in under 60 seconds with our streamlined checkout process." />
            <FeatureCard
              icon={Shield} color="bg-gradient-to-br from-emerald-500 to-teal-600"
              title="Secure Payments" desc="Bank-grade security for all transactions. Your money is always safe with us." />
            <FeatureCard
              icon={TrendingUp} color="bg-gradient-to-br from-cyan-500 to-blue-600"
              title="Live PNR Tracking" desc="Real-time status updates for your booking. Know before you go." />
            <FeatureCard
              icon={Star} color="bg-gradient-to-br from-amber-500 to-orange-600"
              title="Easy Cancellations" desc="Hassle-free cancellations with instant refund calculation and processing." />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-strong rounded-3xl p-12 border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.4), transparent 70%)' }} />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Start Your Journey Today
              </h2>
              <p className="text-slate-400 mb-8">Join thousands of travelers booking smarter with RailAxis</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate('/register')}
                  className="px-8 py-3 rounded-xl font-semibold text-white btn-glow transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  Create Free Account
                </button>
                <button onClick={() => navigate('/search')}
                  className="px-8 py-3 rounded-xl font-semibold text-slate-300 glass border border-white/10 hover:border-indigo-500/30 transition-all">
                  Search Trains
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Fix missing import
const Ticket = ({ size, className }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2M13 17v2M13 11v2"/>
  </svg>
);

export default Home;
