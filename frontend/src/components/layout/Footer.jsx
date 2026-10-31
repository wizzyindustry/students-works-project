import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart, GitBranch, Globe, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ 
      borderTop: '1px solid var(--border-subtle)', 
      background: 'var(--bg-surface)',
      padding: '3rem 2rem 2rem',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div className="navbar-brand-icon" style={{ width: '32px', height: '32px' }}>
                <GraduationCap size={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>
                Scholar<span style={{ color: 'var(--primary)' }}>Hub</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '280px' }}>
              The open, student-powered academic resources repository for universities. Empowering collaborative learning and exam readiness.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Resources
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <Link to="/browse" style={{ color: 'var(--text-secondary)' }}>Browse Programs</Link>
              <Link to="/search?type=past-exam" style={{ color: 'var(--text-secondary)' }}>Past Examination Papers</Link>
              <Link to="/search?type=lecture-notes" style={{ color: 'var(--text-secondary)' }}>Lecture Slides & Notes</Link>
              <Link to="/upload" style={{ color: 'var(--text-secondary)' }}>Contribute Materials</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Community
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <Link to="/register" style={{ color: 'var(--text-secondary)' }}>Create Free Account</Link>
              <Link to="/login" style={{ color: 'var(--text-secondary)' }}>Student Portal</Link>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <GitBranch size={14} /> Open Source Project
              </a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Compliance & Security
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} /> Academic Honor Code
              </span>
              <span style={{ color: 'var(--text-muted)' }}>Anti-Plagiarism Protection</span>
              <span style={{ color: 'var(--text-muted)' }}>Strict Content Moderation</span>
            </div>
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid var(--border-subtle)', 
          paddingTop: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} ScholarHub Academic Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built with React &amp; Vite for students everywhere.
          </div>
        </div>
      </div>
    </footer>
  );
}
