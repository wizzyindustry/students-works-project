import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, LogIn, Sparkles, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch {
      // Error handled by AuthContext via Toast
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setSubmitting(true);
    try {
      await loginAsDemo(role);
      navigate(role === 'admin' ? '/admin' : redirectPath);
    } catch {
      // Handled
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '460px', margin: '0 auto' }}>
      <div className="glass-card accent-glow" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="navbar-brand-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
            <GraduationCap size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Sign in to access lecture notes, past exams, and course materials
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">University Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                required
                className="form-input"
                placeholder="student@udom.ac.tz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => alert('For password reset, please contact university ICT support or use demo accounts below.')}>
                Forgot password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <Lock size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="remember" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Remember me on this browser
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginBottom: '1.5rem' }}
          >
            <LogIn size={18} />
            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div style={{
          background: 'var(--bg-muted)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <Sparkles size={14} color="var(--primary)" /> Quick Demo Logins
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDemoLogin('student')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', gap: '6px' }}
            >
              <User size={14} color="var(--accent-emerald)" />
              <span>Student Demo</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDemoLogin('admin')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', gap: '6px' }}
            >
              <ShieldCheck size={14} color="var(--primary)" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
