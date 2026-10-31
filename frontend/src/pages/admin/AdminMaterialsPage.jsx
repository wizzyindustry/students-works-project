import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck, 
  Search, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  Clock, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';

export function AdminMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');

  // Reject Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const toast = useToast();

  useEffect(() => {
    loadMaterials();
  }, [statusFilter]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminMaterials({
        status: statusFilter || undefined,
        search: search.trim() || undefined
      });
      setMaterials(res.materials || []);
    } catch {
      toast.error('Failed to load materials queue');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (matId) => {
    try {
      await api.approveMaterial(matId, 'approved');
      setMaterials(prev => prev.map(m => m.id === matId ? { ...m, status: 'approved' } : m));
      toast.success('Material approved and published to students');
    } catch {
      toast.error('Failed to approve');
    }
  };

  const openRejectModal = (mat) => {
    setSelectedMaterial(mat);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMaterial) return;
    setProcessing(true);
    try {
      await api.approveMaterial(selectedMaterial.id, 'rejected', rejectionReason);
      setMaterials(prev => prev.map(m => m.id === selectedMaterial.id ? { ...m, status: 'rejected', rejectionReason } : m));
      toast.success('Material marked as rejected with reason');
      setRejectModalOpen(false);
    } catch {
      toast.error('Failed to reject');
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = (mat) => {
    setSelectedMaterial(mat);
    setDeleteModalOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedMaterial) return;
    setProcessing(true);
    try {
      await api.deleteMaterial(selectedMaterial.id);
      setMaterials(prev => prev.filter(m => m.id !== selectedMaterial.id));
      toast.success('Material permanently deleted');
      setDeleteModalOpen(false);
    } catch {
      toast.error('Failed to delete material');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>Resource Moderation Queue</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Inspect student submissions, ensure academic integrity, and approve for public catalog
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Pending Review', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'All Materials', value: '' }
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
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading materials...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <FileCheck size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No materials in this queue</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {statusFilter ? `There are no ${statusFilter} uploads.` : 'No submissions found.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Course</th>
                <th>Uploader</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(m => (
                <tr key={m.id}>
                  <td>
                    <div>
                      <Link to={`/material/${m.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {m.title}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {m.formattedSize || '2.0 MB'} • Uploaded {new Date(m.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{m.course?.code || 'CS211'}</span>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>
                    {m.uploader?.fullName || 'Student'}
                  </td>
                  <td>
                    <span className="badge badge-primary">{m.materialType?.name || 'Notes'}</span>
                  </td>
                  <td>
                    {m.status === 'approved' && (
                      <span className="badge badge-success"><CheckCircle2 size={12} /> Approved</span>
                    )}
                    {m.status === 'pending' && (
                      <span className="badge badge-warning"><Clock size={12} /> Pending</span>
                    )}
                    {m.status === 'rejected' && (
                      <span className="badge badge-danger"><AlertCircle size={12} /> Rejected</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <Link to={`/material/${m.id}`} className="btn btn-secondary btn-sm" title="Preview">
                        <Eye size={13} />
                      </Link>

                      {m.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(m.id)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          title="Approve"
                        >
                          <Check size={14} /> Approve
                        </button>
                      )}

                      {m.status !== 'rejected' && (
                        <button
                          onClick={() => openRejectModal(m)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--accent-rose)', padding: '4px 8px', fontSize: '0.8rem' }}
                          title="Reject"
                        >
                          <X size={14} /> Reject
                        </button>
                      )}

                      <button
                        onClick={() => confirmDelete(m)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--accent-rose)' }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Resource Submission"
      >
        <form onSubmit={handleRejectSubmit}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.925rem' }}>
            Provide constructive feedback to the student explaining why this material cannot be published:
          </p>

          <div className="form-group">
            <label className="form-label">Rejection Reason</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="e.g. Scans are blurry or incomplete, watermark copyright violation, missing key solutions..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setRejectModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="btn btn-danger">
              {processing ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Material"
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Are you sure you want to permanently delete <strong>{selectedMaterial?.title}</strong>?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={() => setDeleteModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleDeleteSubmit} disabled={processing} className="btn btn-danger">
            {processing ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
