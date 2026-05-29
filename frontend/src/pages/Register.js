// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Train, Mail, Lock, User, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => { setForm({ ...form, [field]: e.target.value }); setErrors({ ...errors, [field]: '' }); };

  const strength = form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 'strong' : form.password.length >= 6 ? 'medium' : 'weak';

  const features = ['Free ticket booking', 'PNR status tracking', 'Easy cancellations', 'Booking history'];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 page-enter">
      <div className="absolute inset-0 animated-bg" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left panel */}
        <div className="hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Train size={24} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold gradient-text">RailAxis</span>
          </Link>
          <h2 className="font-display text-4xl font-extrabold text-white mb-4 leading-tight">
            Start your journey<br />
            <span className="gradient-text">the right way.</span>
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Join thousands of travelers who book smarter with RailAxis. Everything you need for seamless train travel.
          </p>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={13} className="text-emerald-400" />
                </div>
                <span className="text-slate-300 text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                <Train size={20} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold gradient-text">RailAxis</span>
            </Link>
          </div>

          <div className="glass-strong rounded-3xl border border-white/10 p-7 shadow-card">
            <h1 className="font-display text-2xl font-bold text-white mb-1">Create account</h1>
            <p className="text-slate-500 text-sm mb-6">It's free and only takes a minute</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <div className="relative">
                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={form.name} onChange={set('name')} placeholder="Full Name"
                    className={`w-full input-dark rounded-xl pl-10 pr-4 py-3 text-sm ${errors.name ? 'border-red-500/50' : ''}`} />
                </div>
                {errors.name && <p className="text-xs text-red-400 mt-1 ml-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" value={form.email} onChange={set('email')} placeholder="Email Address"
                    className={`w-full input-dark rounded-xl pl-10 pr-4 py-3 text-sm ${errors.email ? 'border-red-500/50' : ''}`} />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1 ml-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="relative">
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="Phone (optional)"
                  className="w-full input-dark rounded-xl pl-10 pr-4 py-3 text-sm" />
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    placeholder="Password (min 6 chars)"
                    className={`w-full input-dark rounded-xl pl-10 pr-12 py-3 text-sm ${errors.password ? 'border-red-500/50' : ''}`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {form.password && (
                  <div className="flex gap-1 mt-1.5 ml-1">
                    {['weak', 'medium', 'strong'].map((s, i) => (
                      <div key={s} className={`h-1 flex-1 rounded-full transition-all ${
                        (strength === 'weak' && i === 0) ? 'bg-red-500' :
                        (strength === 'medium' && i <= 1) ? 'bg-amber-500' :
                        (strength === 'strong') ? 'bg-emerald-500' : 'bg-white/10'
                      }`} />
                    ))}
                    <span className="text-xs text-slate-500 ml-1">{strength}</span>
                  </div>
                )}
                {errors.password && <p className="text-xs text-red-400 mt-1 ml-1">{errors.password}</p>}
              </div>

              {/* Confirm */}
              <div>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPass ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')}
                    placeholder="Confirm Password"
                    className={`w-full input-dark rounded-xl pl-10 pr-4 py-3 text-sm ${errors.confirm ? 'border-red-500/50' : ''}`} />
                </div>
                {errors.confirm && <p className="text-xs text-red-400 mt-1 ml-1">{errors.confirm}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white btn-glow disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
