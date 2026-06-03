// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('railToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('railToken');
      localStorage.removeItem('railUser');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || { message: 'Network error. Please try again.' });
  }
);

// ─── Auth APIs ─────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ─── Train APIs ────────────────────────────────────────────────────────
export const trainAPI = {
  search: (params) => api.get('/trains/search', { params }),
  getAll: (params) => api.get('/trains', { params }),
  getById: (id) => api.get(`/trains/${id}`),
  create: (data) => api.post('/trains', data),
  update: (id, data) => api.put(`/trains/${id}`, data),
  delete: (id) => api.delete(`/trains/${id}`),
  getPopularRoutes: () => api.get('/trains/popular-routes'),
};

// ─── Booking APIs ──────────────────────────────────────────────────────
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getByPNR: (pnr) => api.get(`/bookings/pnr/${pnr}`),
  cancel: (data) => api.post('/bookings/cancel', data),
};

// ─── PNR APIs ──────────────────────────────────────────────────────────
export const pnrAPI = {
  check: (pnr) => api.get(`/pnr/${pnr}`),
};

// ─── Admin APIs ────────────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle`),
};

// ─── Station APIs ──────────────────────────────────────────────────────
export const stationAPI = {
  search: (q) => api.get('/stations', { params: { q } }),
};

// ─── Payment APIs ──────────────────────────────────────────────────────
export const paymentAPI = {
  createOrder: (bookingData) => api.post('/payment/create-order', { bookingData }),
  verifyPayment: (data) => api.post('/payment/verify', data),
};

export default api;
