import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Building, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Settings, 
  Upload, 
  Download, 
  Bookmark, 
  ShieldCheck 
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatCard } from '../components/common/StatCard.jsx';

export function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [stats, setStats] = useState({
    uploadsCount: 0,
    downloadsCount: 0,
    bookmarksCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getProfile();
        if (res.user) setProfileData(res.user);
        if (res.stats) setStats(res.stats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', width: '100%' }}>
      {/* Header Profile Card */}
      <div className="glass-card accent-glow" style={{ padding: '2.5rem 2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--gradient-brand)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 800,
          margin: '0 auto 1.25rem',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
        }}>
          {profileData?.fullName?.charAt(0).toUpperCase() || 'U'}
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {profileData?.fullName || 'Scholar'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1rem' }}>
          {profileData?.email}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-primary">
            {profileData?.role === 'admin' ? (
              <><ShieldCheck size={13} /> Administrator</>
            ) : (
              <><GraduationCap size={13} /> Student Scholar</>
            )}
          </span>
          {profileData?.studentNumber && (
            <span className="badge badge-secondary">
              ID: {profileData.studentNumber}
            </span>
          )}
          {profileData?.yearOfStudy && (
            <span className="badge badge-secondary">
              Year {profileData.yearOfStudy}
            </span>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard
          title="My Uploads"
          value={stats.uploadsCount || 0}
          subtitle="Materials contributed"
          icon={Upload}
          color="var(--primary)"
          bgLight="var(--primary-light)"
        />
        <StatCard
          title="Downloaded"
          value={stats.downloadsCount || 0}
          subtitle="Study guides downloaded"
          icon={Download}
          color="var(--accent-emerald)"
          bgLight="var(--accent-emerald-light)"
        />
        <StatCard
          title="Saved Bookmarks"
          value={stats.bookmarksCount || 0}
          subtitle="Quick access items"
          icon={Bookmark}
          color="var(--secondary)"
          bgLight="var(--secondary-light)"
        />
      </div>

      {/* Academic Affiliation Details */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Academic Affiliation</h3>
          <Link to="/settings" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <Settings size={14} /> Edit Affiliation
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building size={13} /> University
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {profileData?.universityName || 'University of Dodoma (UDOM)'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={13} /> College / Faculty
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {profileData?.collegeName || 'College of Informatics and Virtual Education'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <GraduationCap size={13} /> Degree Program
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {profileData?.programName || 'BSc in Computer Science'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} /> Current Level
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Year {profileData?.yearOfStudy || 3} Undergraduate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
