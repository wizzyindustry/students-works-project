import React, { useState } from 'react';
import { User, Lock, Save, Moon, Sun, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [studentNumber, setStudentNumber] = useState(user?.studentNumber || '');
  const [yearOfStudy, setYearOfStudy] = useState(String(user?.yearOfStudy || '1'));
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        studentNumber: studentNumber.trim(),
        yearOfStudy: Number(yearOfStudy)
      });
    } catch {
      // Handled
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setSavingPassword(true);
    try {
      // Simulated or API call
      await new Promise(r => setTimeout(r, 600));
      toast.success('Password successfully changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>Account &amp; Preferences</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Manage your personal details, academic credentials, and security settings
        </p>
      </div>

      {/* Profile Form */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="var(--primary)" /> Profile Information
        </h3>

        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              required
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="studentNumber">Student Number</label>
              <input
                id="studentNumber"
                type="text"
                className="form-input"
                placeholder="T21-03-04921"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="yearOfStudy">Year of Study</label>
              <select
                id="yearOfStudy"
                className="form-select"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
              >
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
                <option value="5">Year 5</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={savingProfile} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
              <Save size={15} />
              <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Appearance Settings */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDark ? <Moon size={18} color="#f59e0b" /> : <Sun size={18} color="#f59e0b" />} Appearance Theme
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Active Theme Mode</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Currently using {isDark ? 'Dark Mode' : 'Light Mode'} interface styling
            </div>
          </div>
          <button onClick={toggleTheme} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            {isDark ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} />}
            <span>Switch to {isDark ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} color="var(--primary)" /> Change Security Password
        </h3>

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              required
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                required
                className="form-input"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="form-input"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={savingPassword} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
              <Lock size={15} />
              <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
