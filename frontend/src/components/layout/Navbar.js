// src/components/layout/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Train, Search, Ticket, CircleX, User, LogIn, Menu, X,
  LayoutDashboard, ChevronDown, Bell, Settings, LogOut, Shield
} from 'lucide-react';

const Navbar = ({ isAdmin }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home', icon: Train },
    { to: '/search', label: 'Search Trains', icon: Search },
    { to: '/pnr-status', label: 'PNR Status', icon: Ticket },
    ...(isAuthenticated ? [
      { to: '/my-bookings', label: 'My Bookings', icon: Ticket },
      { to: '/cancel-ticket', label: 'Cancel Ticket', icon: CircleX },
    ] : []),
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/trains', label: 'Trains', icon: Train },
    { to: '/admin/users', label: 'Users', icon: User },
    { to: '/admin/bookings', label: 'Bookings', icon: Ticket },
  ];

  const links = isAdmin ? adminLinks : navLinks;
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'glass border-b border-white/10 py-3' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Train size={20} className="text-white" />
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ boxShadow: '0 0 20px rgba(99,102,241,0.6)' }} />
            </div>
            <div>
              <span className="font-display font-bold text-xl gradient-text">RailAxis</span>
              {isAdmin && <span className="ml-2 text-xs text-indigo-400 font-mono bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">ADMIN</span>}
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'text-white bg-indigo-500/20 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/10 hover:border-indigo-500/40 transition-all">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{user?.name?.split(' ')[0]}</span>
                  {user?.role === 'admin' && <Shield size={12} className="text-indigo-400" />}
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass-strong border border-white/10 rounded-2xl p-2 shadow-card"
                    onClick={() => setUserMenuOpen(false)}>
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-slate-400">{user?.email}</p>
                    </div>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                        <LayoutDashboard size={14} /> Admin Panel
                      </Link>
                    )}
                    <Link to="/my-bookings" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5 transition-colors">
                      <Ticket size={14} /> My Bookings
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white transition-colors">
                  <LogIn size={15} /> Login
                </Link>
                <Link to="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white btn-glow"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 glass rounded-2xl border border-white/10 p-4 space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(to) ? 'text-white bg-indigo-500/20' : 'text-slate-400'
                }`}>
                <Icon size={16} /> {label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-2 mt-2">
              {isAuthenticated ? (
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400">
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm text-slate-400">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 text-sm text-white rounded-xl font-semibold"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
