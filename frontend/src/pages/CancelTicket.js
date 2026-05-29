// src/pages/CancelTicket.js
import React, { useState } from 'react';
import { bookingAPI } from '../services/api';
import { XCircle, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CancelTicket = () => {
  const navigate = useNavigate();
  const [pnr, setPnr] = useState('');
  const [reason, setReason] = useState('');
  const [step, setStep] = useState(1); // 1: input, 2: confirm modal, 3: success
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const REASONS = [
    'Change of plans', 'Emergency situation', 'Health issues',
    'Travel date changed', 'Found better alternative', 'Other',
  ];

  const handleCancel = async () => {
    if (!pnr.trim()) { toast.error('Please enter PNR'); return; }
    setLoading(true);
    try {
      const res = await bookingAPI.cancel({ pnr: pnr.trim().toUpperCase(), reason });
      setResult(res);
      setStep(3);
      toast.success('Ticket cancelled successfully');
    } catch (err) {
      toast.error(err.message || 'Cancellation failed');
    } finally {
      setLoading(false);
    }
  };

  // Refund policy helper
  const RefundPolicy = () => (
    <div className="space-y-2">
      {[
        ['3+ days before journey', '90% refund'],
        ['1-3 days before journey', '50% refund'],
        ['Less than 24 hours', '25% refund'],
      ].map(([when, amount]) => (
        <div key={when} className="flex justify-between items-center glass rounded-xl px-4 py-2.5">
          <span className="text-sm text-slate-400">{when}</span>
          <span className="text-sm font-semibold text-emerald-400">{amount}</span>
        </div>
      ))}
    </div>
  );

  if (step === 3 && result) return (
    <div className="pt-24 pb-16 px-4 page-enter min-h-screen">
      <div className="max-w-xl mx-auto">
        <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-8 text-center border-b border-white/10"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05))' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Cancellation Successful</h2>
            <p className="text-slate-500 text-sm">Your ticket has been cancelled</p>
          </div>
          <div className="p-6 space-y-3">
            {[
              ['PNR Number', pnr.toUpperCase()],
              ['Refund Amount', `₹${result.refundAmount}`],
              ['Refund Percentage', result.refundPercent],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between glass rounded-xl px-4 py-3">
                <span className="text-sm text-slate-500">{label}</span>
                <span className={`text-sm font-semibold ${label === 'Refund Amount' ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
              </div>
            ))}
            <div className="glass rounded-xl px-4 py-3 border border-indigo-500/20">
              <p className="text-xs text-indigo-400">Refund will be credited to your original payment method within 5-7 business days.</p>
            </div>
          </div>
          <div className="p-6 border-t border-white/10 flex gap-3">
            <button onClick={() => navigate('/my-bookings')}
              className="flex-1 py-3 rounded-xl glass border border-white/10 text-sm text-slate-300 hover:text-white transition-colors font-medium">
              My Bookings
            </button>
            <button onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white btn-glow"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-24 pb-16 px-4 page-enter min-h-screen">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Cancel Ticket</h1>
            <p className="text-slate-500 text-sm">Request cancellation and get a refund</p>
          </div>
        </div>

        {/* Main form */}
        <div className="glass-strong rounded-2xl border border-white/10 p-6 mb-5">
          <div className="mb-5">
            <label className="block text-xs text-slate-500 mb-2">PNR Number *</label>
            <input type="text" value={pnr} onChange={e => setPnr(e.target.value.toUpperCase())}
              placeholder="Enter your PNR number"
              className="w-full input-dark rounded-xl px-4 py-3 text-sm font-mono tracking-widest" />
          </div>

          <div className="mb-5">
            <label className="block text-xs text-slate-500 mb-2">Reason for Cancellation</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {REASONS.map(r => (
                <button key={r} type="button" onClick={() => setReason(r)}
                  className={`px-3 py-2 rounded-xl text-xs text-left transition-all border ${reason === r ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'glass border-white/8 text-slate-400 hover:border-white/20'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-4 rounded-xl mb-5 border border-amber-500/20 bg-amber-500/5">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-300 font-medium mb-1">Before you cancel</p>
              <p className="text-xs text-slate-500">Cancellation is irreversible. Refund depends on how far your journey date is.</p>
            </div>
          </div>

          <button onClick={() => { if (!pnr.trim()) { toast.error('Please enter PNR'); return; } setStep(2); }}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.8), rgba(220,38,38,0.9))', color: 'white' }}>
            <XCircle size={16} />
            Proceed to Cancel
          </button>
        </div>

        {/* Refund Policy */}
        <div className="glass rounded-2xl border border-white/8 p-5">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">📋 Refund Policy</h4>
          <RefundPolicy />
        </div>

        {/* Confirm Modal */}
        {step === 2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
            <div className="glass-strong rounded-2xl border border-white/10 p-6 max-w-sm w-full animate-slide-up">
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle size={26} className="text-red-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-1">Confirm Cancellation</h3>
                <p className="text-slate-500 text-sm">PNR: <span className="font-mono text-slate-300">{pnr}</span></p>
              </div>
              <p className="text-xs text-slate-500 text-center mb-5">This action is permanent and cannot be undone. Your refund will be processed based on the cancellation policy.</p>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl glass border border-white/10 text-sm text-slate-400 hover:text-white transition-colors">
                  Go Back
                </button>
                <button onClick={handleCancel} disabled={loading}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,1))' }}>
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {loading ? 'Cancelling...' : 'Yes, Cancel Ticket'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelTicket;
