// src/components/ui/LoadingScreen.js
import React from 'react';

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: '#0a0a0f' }}>
    <div className="text-center">
      {/* Animated train icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 mx-auto rounded-2xl glass flex items-center justify-center animate-pulse-slow">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="animate-float">
            <rect x="4" y="16" width="40" height="24" rx="4" fill="url(#trainGrad)" opacity="0.9" />
            <rect x="8" y="20" width="12" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="22" y="20" width="12" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="10" y="8" width="28" height="10" rx="2" fill="url(#trainGrad)" opacity="0.7" />
            <circle cx="14" cy="42" r="4" fill="#818cf8" />
            <circle cx="34" cy="42" r="4" fill="#818cf8" />
            <defs>
              <linearGradient id="trainGrad" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl" style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }} />
      </div>

      <h2 className="font-display text-2xl font-bold gradient-text mb-2">RailAxis</h2>
      <p className="text-slate-400 text-sm mb-6">Loading your journey...</p>

      {/* Progress bar */}
      <div className="w-48 h-0.5 mx-auto rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full animate-shimmer" style={{
          background: 'linear-gradient(90deg, transparent, #818cf8, #06b6d4, transparent)',
          backgroundSize: '200% 100%',
          width: '100%',
        }} />
      </div>
    </div>
  </div>
);

export default LoadingScreen;
