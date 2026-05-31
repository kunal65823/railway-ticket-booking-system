// server.js - Main Express Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('./utils/loadEnv');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

// ─── CORS ──────────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.FRONTEND_URL || (isProduction ? '' : 'http://localhost:3000'))
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

const isLocalOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin);
    return (
      !isProduction
      && ['http:', 'https:'].includes(protocol)
      && (
        hostname === 'localhost'
        || hostname === '127.0.0.1'
        || hostname === '0.0.0.0'
        || hostname === '::1'
        || hostname === '[::1]'
      )
    );
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}. Add it to FRONTEND_URL if this is expected.`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Body Parser ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logger ────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Database Connection ───────────────────────────────────────────────
try {
  require('./utils/seeder');
  console.log('✅ Supabase client initialized and seeder queued');
} catch (err) {
  console.error('❌ Supabase initialization error:', err.message);
}

// ─── Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/trains',       require('./routes/trains'));
app.use('/api/bookings',     require('./routes/bookings'));
app.use('/api/pnr',          require('./routes/pnr'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/stations',     require('./routes/stations'));

// ─── Health Check ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Railway API is running 🚂', timestamp: new Date() });
});

// ─── 404 Handler ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Start Server ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚂 Railway API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
