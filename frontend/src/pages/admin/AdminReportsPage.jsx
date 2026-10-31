import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flag, CheckCircle2, Clock, AlertTriangle, ExternalLink, MessageSquare } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';

export function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Status update modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const toast = useToast();

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminReports({ status: statusFilter || undefined });
      setReports(res.reports || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status === 'pending' ? 'resolved' : report.status);
    setResolutionNotes(report.resolution || '');
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setProcessing(true);
    try {
      await api.updateReportStatus(selectedReport.id, newStatus, resolutionNotes);
      setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, status: newStatus, resolution: resolutionNotes } : r));
      toast.success(`Report marked as ${newStatus}`);
      setStatusModalOpen(false);
    } catch {
      toast.error('Failed to update report status');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>Reported Content &amp; Flags</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Investigate student issue submissions regarding incorrect solutions or policy violations
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'All Reports', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'Reviewed', value: 'reviewed' },
          { label: 'Resolved', value: 'resolved' },
          { label: 'Dismissed', value: 'dismissed' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={statusFilter === tab.value ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '36px', height: '36px' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Flag size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No reports matching this filter</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            All clear! No student reports filed under this category.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Reason</th>
                <th>Report Details</th>
                <th>Reporter</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>
                    <Link to={`/material/${r.materialId}`} style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {r.materialTitle || 'Material'} <ExternalLink size={12} />
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Date: {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-danger" style={{ textTransform: 'capitalize' }}>
                      {r.reason}
                    </span>
                  </td>
                  <td style={{ maxWidth: '320px', fontSize: '0.875rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>"{r.description}"</div>
                    {r.resolution && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '4px' }}>
                        <strong>Resolution:</strong> {r.resolution}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <div>{r.reporterName || 'Student'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.reporterEmail}</div>
                  </td>
                  <td>
                    {r.status === 'pending' && <span className="badge badge-warning"><Clock size={12} /> Pending</span>}
                    {r.status === 'reviewed' && <span className="badge badge-primary">Reviewed</span>}
                    {r.status === 'resolved' && <span className="badge badge-success"><CheckCircle2 size={12} /> Resolved</span>}
                    {r.status === 'dismissed' && <span className="badge badge-secondary">Dismissed</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => openStatusModal(r)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '4px' }}
                    >
                      <MessageSquare size={13} /> Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Resolve / Update Report Status"
      >
        <form onSubmit={handleStatusSubmit}>
          <div className="form-group">
            <label className="form-label">Update Status</label>
            <select
              className="form-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed (Under investigation)</option>
              <option value="resolved">Resolved (Corrective action taken)</option>
              <option value="dismissed">Dismissed (No violation found)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Resolution Notes / Action Taken</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Verified and replaced document, or warned user regarding copyright guidelines..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setStatusModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="btn btn-primary">
              {processing ? 'Saving...' : 'Save Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
