// src/App.js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingScreen from './components/ui/LoadingScreen';

const Home = lazy(() => import('./pages/Home'));
const SearchTrains = lazy(() => import('./pages/SearchTrains'));
const BookTicket = lazy(() => import('./pages/BookTicket'));
const PNRStatus = lazy(() => import('./pages/PNRStatus'));
const CancelTicket = lazy(() => import('./pages/CancelTicket'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTrains = lazy(() => import('./pages/admin/AdminTrains'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const SupabaseDemo = lazy(() => import('./pages/SupabaseDemo'));

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const AdminLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar isAdmin />
    <main className="flex-1">{children}</main>
  </div>
);

const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/search" element={<PublicLayout><SearchTrains /></PublicLayout>} />
        <Route path="/pnr-status" element={<PublicLayout><PNRStatus /></PublicLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book/:trainId" element={<ProtectedRoute><PublicLayout><BookTicket /></PublicLayout></ProtectedRoute>} />
        <Route path="/cancel-ticket" element={<ProtectedRoute><PublicLayout><CancelTicket /></PublicLayout></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><PublicLayout><MyBookings /></PublicLayout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/trains" element={<ProtectedRoute adminOnly><AdminLayout><AdminTrains /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><AdminLayout><AdminBookings /></AdminLayout></ProtectedRoute>} />
        <Route path="/supabase-demo" element={<PublicLayout><SupabaseDemo /></PublicLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="animated-bg min-h-screen">
          <div className="orb w-96 h-96 bg-indigo-500 top-0 right-0 fixed" />
          <div className="orb w-80 h-80 bg-violet-600 bottom-1/3 left-0 fixed" />
          <div className="orb w-64 h-64 bg-cyan-500 top-1/2 left-1/2 fixed" style={{opacity:0.06}} />
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            style: {
              background:'rgba(17,17,24,0.95)',color:'#f1f5f9',
              border:'1px solid rgba(255,255,255,0.1)',backdropFilter:'blur(20px)',
              fontFamily:'"DM Sans",sans-serif',
            },
            success:{iconTheme:{primary:'#10b981',secondary:'#0a0a0f'}},
            error:{iconTheme:{primary:'#ef4444',secondary:'#0a0a0f'}},
          }} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
