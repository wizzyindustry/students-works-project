import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setTokenState] = useState(() => localStorage.getItem('accessToken') || null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (token) {
      api.setToken(token);
    }
  }, [token]);

  const setAuth = (newToken, newUser) => {
    setTokenState(newToken);
    setUser(newUser);
    api.setToken(newToken);
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setAuth(data.accessToken, data.user);
      toast.success(`Welcome back, ${data.user.fullName || 'Scholar'}!`);
      return data.user;
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await api.register(userData);
      setAuth(data.accessToken, data.user);
      toast.success('Account created successfully! Welcome to ScholarHub.');
      return data.user;
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check form fields.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTokenState(null);
    api.setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    toast.info('Signed out successfully');
  };

  const loginAsDemo = async (role = 'student') => {
    if (role === 'admin') {
      return login('admin@udom.ac.tz', 'admin123');
    }
    return login('student@udom.ac.tz', 'student123');
  };

  const updateProfile = async (updates) => {
    try {
      const res = await api.updateProfile(updates);
      const updatedUser = { ...user, ...res.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    register,
    logout,
    loginAsDemo,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
