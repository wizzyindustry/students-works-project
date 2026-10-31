import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileCheck, 
  Clock, 
  Flag, 
  ArrowRight, 
  Check, 
  X, 
  Building2, 
  ShieldCheck,
  Download
} from 'lucide-react';
import { api } from '../../services/api.js';
import { StatCard } from '../../components/common/StatCard.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import confetti from 'canvas-confetti';

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: { total: 0, students: 0, admins: 0 },
    materials: { total: 0, approved: 0, pending: 0, rejected: 0, totalDownloads: 0 },
    reports: { total: 0, pending: 0, resolved: 0 }
  });
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, matRes, repRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminMaterials({ limit: 5 }),
        api.getAdminReports({ status: 'pending', limit: 4 })
      ]);

      if (statsRes.stats) setStats(statsRes.stats);
      if (matRes.materials) setRecentMaterials(matRes.materials);
      if (repRes.reports) setPendingReports(repRes.reports);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (matId) => {
    try {
      await api.approveMaterial(matId, 'approved');
      setRecentMaterials(prev => prev.map(m => m.id === matId ? { ...m, status: 'approved' } : m));
      setStats(prev => ({
        ...prev,
        materials: {
          ...prev.materials,
          approved: prev.materials.approved + 1,
          pending: Math.max(0, prev.materials.pending - 1)
        }
      }));
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      toast.success('Material approved and published!');
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={16} /> Admin Portal
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>Platform Overview &amp; Control</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/materials" className="btn btn-secondary btn-sm">
            <FileCheck size={15} /> Moderate Materials
          </Link>
          <Link to="/admin/academic" className="btn btn-primary btn-sm">
            <Building2 size={15} /> Academic Structure
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <StatCard
          title="Total User Accounts"
          value={stats.users.total}
          subtitle={`${stats.users.students} students • ${stats.users.admins} admins`}
          icon={Users}
          color="var(--primary)"
          bgLight="var(--primary-light)"
        />
        <StatCard
          title="Approved Materials"
          value={stats.materials.approved}
          subtitle={`${stats.materials.totalDownloads} total downloads`}
          icon={FileCheck}
          color="var(--accent-emerald)"
          bgLight="var(--accent-emerald-light)"
        />
        <StatCard
          title="Pending Moderation"
          value={stats.materials.pending}
          subtitle={`${stats.materials.rejected} rejected`}
          icon={Clock}
          color="var(--accent-amber)"
          bgLight="var(--accent-amber-light)"
        />
        <StatCard
          title="Unresolved Reports"
          value={stats.reports.pending}
          subtitle={`${stats.reports.total} lifetime reports`}
          icon={Flag}
          color="var(--accent-rose)"
          bgLight="var(--accent-rose-light)"
        />
      </div>

      {/* Two Column Section: Recent Uploads & Reports */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.75rem' }}>
        {/* Recent Materials */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Moderation Queue</h3>
            <Link to="/admin/materials" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentMaterials.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              No recent uploads to review.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {recentMaterials.map(m => (
                <div key={m.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  gap: '0.75rem'
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.925rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {m.course?.code} • By {m.uploader?.fullName || 'Student'} • Status: <strong style={{ textTransform: 'capitalize', color: m.status === 'approved' ? 'var(--accent-emerald)' : m.status === 'pending' ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>{m.status}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {m.status === 'pending' && (
                      <button
                        onClick={() => handleQuickApprove(m.id)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', gap: '4px' }}
                        title="Approve immediately"
                      >
                        <Check size={14} /> Approve
                      </button>
                    )}
                    <Link to={`/material/${m.id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                      Inspect
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Reports */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Pending Reports</h3>
            <Link to="/admin/reports" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {pendingReports.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              No pending student flags or reports. Good job!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pendingReports.map(r => (
                <div key={r.id} style={{
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="badge badge-danger" style={{ textTransform: 'capitalize' }}>
                      {r.reason}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                    {r.materialTitle}
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    "{r.description}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
