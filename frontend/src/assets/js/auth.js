const API_BASE = '/api';

export class Auth {
  constructor() {
    this.token = null;
    this.user = null;
  }

  setAuth(token, user) {
    this.token = token;
    this.user = user;
    window.storage.set('accessToken', token);
    window.storage.set('user', user);
  }

  clearAuth() {
    this.token = null;
    this.user = null;
    window.storage.remove('accessToken');
    window.storage.remove('refreshToken');
    window.storage.remove('user');
  }

  isAuthenticated() {
    return !!this.token;
  }

  isAdmin() {
    return this.user?.role === 'admin';
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    this.setAuth(data.accessToken, data.user);
    window.storage.set('refreshToken', data.refreshToken);
    return data;
  }

  async register(userData) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    this.setAuth(data.accessToken, data.user);
    window.storage.set('refreshToken', data.refreshToken);
    return data;
  }

  async logout() {
    this.clearAuth();
    window.router.navigate('/login');
    window.toast.success('Logged out successfully');
  }

  async refreshToken() {
    const refreshToken = window.storage.get('refreshToken');
    if (!refreshToken) {
      this.logout();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed');
      }

      this.setAuth(data.accessToken, this.user);
      window.storage.set('refreshToken', data.refreshToken);
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  async apiRequest(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    // Handle token expiration
    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry with new token
        headers['Authorization'] = `Bearer ${this.token}`;
        return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      }
    }

    return response;
  }

  async getProfile() {
    const response = await this.apiRequest('/auth/profile');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch profile');
    }

    this.user = { ...this.user, ...data.user };
    window.storage.set('user', this.user);
    return data;
  }

  async updateProfile(updates) {
    const response = await this.apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    this.user = { ...this.user, ...data.user };
    window.storage.set('user', this.user);
    return data;
  }

  async changePassword(currentPassword, newPassword) {
    const response = await this.apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to change password');
    }

    return data;
  }

  async forgotPassword(email) {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send reset email');
    }

    return data;
  }

  async resetPassword(token, password) {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }

    return data;
  }
}