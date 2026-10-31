import React from 'react';
import { CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';

export function AuthTransitionOverlay({ isOpen, title, subtitle, userName }) {
  if (!isOpen) return null;

  return (
    <div className="auth-celebration-overlay" role="dialog" aria-modal="true">
      <div className="auth-celebration-card">
        <div className="auth-success-circle">
          <CheckCircle2 size={44} strokeWidth={2.5} />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.85rem' }}>
          <Sparkles size={14} /> Authentication Verified
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
          {title}
        </h3>

        {userName && (
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            {userName}
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '340px', margin: '0 auto' }}>
          {subtitle || 'Initializing your academic catalog and personalized courses...'}
        </p>

        <div className="auth-spinner" />
      </div>
    </div>
  );
}
