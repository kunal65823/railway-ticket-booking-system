// src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('railToken'),
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('railToken');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      try {
        const res = await authAPI.getMe();
        dispatch({ type: 'SET_USER', payload: res.user });
      } catch {
        localStorage.removeItem('railToken');
        localStorage.removeItem('railUser');
        dispatch({ type: 'LOGOUT' });
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('railToken', res.token);
    localStorage.setItem('railUser', JSON.stringify(res.user));
    dispatch({ type: 'SET_TOKEN', payload: res.token });
    dispatch({ type: 'SET_USER', payload: res.user });
    toast.success(`Welcome back, ${res.user.name}! 🚂`);
    return res;
  };

  const register = async (name, email, password, phone) => {
    const res = await authAPI.register({ name, email, password, phone });
    localStorage.setItem('railToken', res.token);
    localStorage.setItem('railUser', JSON.stringify(res.user));
    dispatch({ type: 'SET_TOKEN', payload: res.token });
    dispatch({ type: 'SET_USER', payload: res.user });
    toast.success(`Account created! Welcome, ${res.user.name}! 🎉`);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('railToken');
    localStorage.removeItem('railUser');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
