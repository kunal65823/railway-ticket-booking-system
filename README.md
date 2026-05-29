# 🚂 RailAxis — Modern Railway Management System

A production-grade full-stack Railway Management System converted from PHP/MySQL to a modern React + Node.js + MongoDB stack with a stunning dark UI.

---

## ✨ Features

### Public Pages
- **Home** — Animated hero, live train search, stats counter, popular routes, feature showcase
- **Search Trains** — Source/destination selector, filters, sortable train cards with fare details
- **PNR Status** — Real-time PNR lookup with QR code display
- **Login / Register** — JWT authentication with form validation and password strength meter

### Protected Pages (Login Required)
- **Book Ticket** — Multi-step booking with passenger management, class selection, fare breakdown
- **My Bookings** — Full booking history with status filters, expandable cards, QR codes
- **Cancel Ticket** — PNR cancellation with refund calculation and confirmation modal

### Admin Panel (`/admin`)
- **Dashboard** — Revenue analytics, monthly charts (Recharts), booking distribution pie chart
- **Train Management** — CRUD operations with modal form, seat availability tracker
- **User Management** — Search, activate/deactivate users
- **Bookings Management** — Filterable table with CSV export

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS v3, Framer Motion ready |
| UI Components | Lucide React, Recharts, React Hot Toast |
| Routing | React Router DOM v6 |
| State | Context API + useReducer |
| HTTP Client | Axios with interceptors |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Security | Helmet, CORS, Rate Limiting, Compression |
| QR Codes | qrcode npm package |

---

## 📁 Project Structure

```
railway-system/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── trainController.js
│   │   ├── bookingController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js              # JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js
│   │   ├── Train.js
│   │   ├── Booking.js
│   │   └── Station.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── trains.js
│   │   ├── bookings.js
│   │   ├── pnr.js
│   │   ├── admin.js
│   │   └── stations.js
│   ├── utils/
│   │   └── seeder.js            # Auto-seeds trains, admin, stations
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.js
    │   │   │   └── Footer.js
    │   │   └── ui/
    │   │       └── LoadingScreen.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── SearchTrains.js
    │   │   ├── BookTicket.js
    │   │   ├── PNRStatus.js
    │   │   ├── CancelTicket.js
    │   │   ├── MyBookings.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   └── admin/
    │   │       ├── AdminDashboard.js
    │   │       ├── AdminTrains.js
    │   │       ├── AdminUsers.js
    │   │       └── AdminBookings.js
    │   ├── services/
    │   │   └── api.js            # Axios instance + all API calls
    │   ├── App.js
    │   └── index.css
    ├── tailwind.config.js
    └── .env.example
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone & Install

```bash
git clone <your-repo>
cd railway-system

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/railway_db
JWT_SECRET=your_super_long_random_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Run

```bash
# Terminal 1 - Backend
cd backend
npm run dev    # uses nodemon

# Terminal 2 - Frontend
cd frontend
npm start
```

The backend auto-seeds trains, stations, and an admin account on first run.

### 4. Default Admin Login
```
Email:    admin@railway.com
Password: Admin@123
```

---

## 🌐 API Reference

### Authentication
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login & get JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/profile` | JWT | Update profile |

### Trains
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/trains/search?source=Mumbai&destination=Delhi` | — | Search trains |
| GET | `/api/trains/popular-routes` | — | Popular routes |
| GET | `/api/trains` | — | All trains (paginated) |
| POST | `/api/trains` | Admin | Create train |
| PUT | `/api/trains/:id` | Admin | Update train |
| DELETE | `/api/trains/:id` | Admin | Deactivate train |

### Bookings
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/bookings` | JWT | Book ticket |
| GET | `/api/bookings/my` | JWT | My bookings |
| GET | `/api/bookings/pnr/:pnr` | JWT | Get by PNR |
| POST | `/api/bookings/cancel` | JWT | Cancel ticket |

### PNR (Public)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/pnr/:pnr` | — | Check PNR status |

### Admin
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/admin/analytics` | Admin | Dashboard stats |
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/admin/bookings` | Admin | All bookings |
| PATCH | `/api/admin/users/:id/toggle` | Admin | Toggle user status |

---

## 🎨 UI Design System

- **Theme**: Dark premium with animated gradient background
- **Cards**: Glassmorphism (`glass`, `glass-strong` classes)
- **Accent**: Indigo `#6366f1` + Cyan `#06b6d4` + Violet `#8b5cf6`
- **Fonts**: Plus Jakarta Sans (display) + DM Sans (body) from Google Fonts
- **Animations**: CSS keyframes — `animate-float`, `animate-shimmer`, `animate-glow`
- **Badges**: Pre-styled status badges for booking status and train types

---

## ☁️ Deployment

### Backend (Railway.app / Render / Heroku)
1. Set environment variables in dashboard
2. Set start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL` to your deployed backend URL
2. Build command: `npm run build`
3. Output directory: `build`

### MongoDB Atlas
1. Create a free M0 cluster
2. Add IP `0.0.0.0/0` to Network Access for production
3. Create a database user and get the connection string

---

## 🔒 Security Features

- JWT token authentication with 7-day expiry
- Password hashing with bcryptjs (salt rounds: 12)
- Rate limiting (200 req/15min per IP)
- Helmet.js security headers
- CORS restricted to frontend origin
- Role-based access control (user/admin)
- Input validation on all endpoints

---

## 📊 Database Schema

### Users
```js
{ name, email, password (hashed), phone, role, isActive, favoriteRoutes, lastLogin }
```

### Trains
```js
{ trainNumber, trainName, source, destination, departureTime, arrivalTime, 
  duration, totalSeats, availableSeats, trainType, baseFare, classes[], 
  daysOfOperation[], distance, amenities[], rating }
```

### Bookings
```js
{ pnrNumber, user (ref), train (ref), trainSnapshot, passengers[], 
  contactInfo, journeyDate, seatClass, status, totalFare, baseFare, taxes,
  paymentStatus, cancellationReason, refundAmount, qrCode }
```

### Stations
```js
{ name, code, city, state, zone, platforms, coordinates }
```

---

*Built with ❤️ — Converted from PHP/MySQL to React + Node.js + MongoDB*
