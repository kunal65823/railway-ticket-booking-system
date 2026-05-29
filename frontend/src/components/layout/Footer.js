// src/components/layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Train, Heart, ExternalLink } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-white/5 mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Train size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">RailAxis</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Next-generation railway management platform. Book, track, and manage your journeys with ease.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-300 mb-4 text-sm">Quick Links</h4>
          <ul className="space-y-2">
            {[['/', 'Home'], ['/search', 'Search Trains'], ['/pnr-status', 'PNR Status'], ['/my-bookings', 'My Bookings']].map(([to, label]) => (
              <li key={to}><Link to={to} className="text-slate-500 text-sm hover:text-indigo-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-300 mb-4 text-sm">Services</h4>
          <ul className="space-y-2">
            {['Ticket Booking', 'Ticket Cancellation', 'PNR Tracking', 'Seat Selection'].map(s => (
              <li key={s}><span className="text-slate-500 text-sm">{s}</span></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-300 mb-4 text-sm">Connect</h4>
          <div className="flex gap-3">
            {[ExternalLink, ExternalLink, ExternalLink].map((Icon, i) => (
              <button key={i} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 border border-white/10 transition-all">
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-600 text-xs">© 2026 RailAxis. All rights reserved.</p>
        <p className="text-slate-600 text-xs flex items-center gap-1">
          Built with <Heart size={12} className="text-rose-500" /> using React + MongoDB
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
