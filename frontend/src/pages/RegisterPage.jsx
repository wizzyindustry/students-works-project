import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, Building, BookOpen, CheckCircle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentNumber: '',
    universityId: '',
    programId: '',
    yearOfStudy: '1',
    password: '',
    confirmPassword: '',
    terms: true
  });

  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Load universities
  useEffect(() => {
    async function fetchUniversities() {
      try {
        const res = await api.getUniversities();
        if (res.universities) {
          setUniversities(res.universities);
          if (res.universities.length > 0) {
            setFormData(prev => ({ ...prev, universityId: res.universities[0].id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUniversities();
  }, []);

  // When university changes, load colleges & programs
  useEffect(() => {
    async function fetchPrograms() {
      if (!formData.universityId) return;
      try {
        const collegesRes = await api.getColleges(formData.universityId);
        const colList = collegesRes.colleges || [];
        const allPrograms = [];
        for (const col of colList) {
          const prgRes = await api.getPrograms(col.id);
          if (prgRes.programs) {
            allPrograms.push(...prgRes.programs);
          }
        }
        setPrograms(allPrograms);
        if (allPrograms.length > 0) {
          setFormData(prev => ({ ...prev, programId: allPrograms[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchPrograms();
  }, [formData.universityId]);

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = calculatePasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (!formData.terms) {
      toast.error('Please accept the terms and honor code');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        studentNumber: formData.studentNumber.trim(),
        universityId: formData.universityId,
        programId: formData.programId,
        yearOfStudy: Number(formData.yearOfStudy)
      });
      navigate('/browse');
    } catch {
      // Handled
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '580px', margin: '0 auto' }}>
      <div className="glass-card accent-glow" style={{ padding: '2.5rem 2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="navbar-brand-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
            <GraduationCap size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Join ScholarHub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Create your academic account to share and access study resources
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                required
                className="form-input"
                placeholder="Kelvin"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                required
                className="form-input"
                placeholder="Mushi"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">University Email</label>
            <input
              id="email"
              type="email"
              required
              className="form-input"
              placeholder="kelvin.mushi@udom.ac.tz"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="studentNumber">Student Registration Number (Optional)</label>
            <input
              id="studentNumber"
              type="text"
              className="form-input"
              placeholder="e.g. T21-03-04921"
              value={formData.studentNumber}
              onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="university">University</label>
              <select
                id="university"
                className="form-select"
                value={formData.universityId}
                onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
              >
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="yearOfStudy">Year of Study</label>
              <select
                id="yearOfStudy"
                className="form-select"
                value={formData.yearOfStudy}
                onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
              >
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
                <option value="5">Year 5</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="program">Degree Program</label>
            <select
              id="program"
              className="form-select"
              value={formData.programId}
              onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
            >
              {programs.length > 0 ? (
                programs.map(p => (
                  <option key={p.id} value={p.id}>{p.code ? `[${p.code}] ` : ''}{p.name}</option>
                ))
              ) : (
                <option value="">Select program...</option>
              )}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="form-input"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="form-input"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          {/* Password strength meter */}
          {formData.password && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ height: '4px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${strength}%`, 
                  background: strength <= 25 ? 'var(--accent-rose)' : strength <= 50 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                  transition: 'all 0.3s ease'
                }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Strength: {strength <= 25 ? 'Weak' : strength <= 50 ? 'Medium' : strength <= 75 ? 'Good' : 'Strong'}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="terms"
              checked={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              I agree to the University Honor Code &amp; Academic Sharing Terms
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginBottom: '1.5rem' }}
          >
            <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
