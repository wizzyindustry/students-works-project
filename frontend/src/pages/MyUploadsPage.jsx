import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Download
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Modal } from '../components/common/Modal.jsx';

export function MyUploadsPage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadUploads();
  }, [statusFilter]);

  const loadUploads = async () => {
    setLoading(true);
    try {
      const res = await api.getUserUploads();
      let list = res.materials || [];
      if (statusFilter) {
        list = list.filter(m => m.status === statusFilter);
      }
      setUploads(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your uploads');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (m) => {
    setSelectedMaterial(m);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;
    setDeleting(true);
    try {
      await api.deleteMaterial(selectedMaterial.id);
      setUploads(prev => prev.filter(m => m.id !== selectedMaterial.id));
      toast.success('Resource deleted');
      setDeleteModalOpen(false);
    } catch {
      toast.error('Failed to delete resource');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>My Uploaded Resources</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Manage the academic materials you shared with your peers
          </p>
        </div>
        <Link to="/upload" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
          <Upload size={15} /> Upload New Material
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'All Uploads', value: '' },
          { label: 'Approved', value: 'approved' },
          { label: 'Pending Review', value: 'pending' },
          { label: 'Rejected', value: 'rejected' }
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

      {/* Uploads List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '36px', height: '36px' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading uploads...</p>
        </div>
      ) : uploads.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Upload size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No uploads found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            {statusFilter ? `You have no ${statusFilter} materials.` : 'You haven’t uploaded any academic resources yet.'}
          </p>
          <Link to="/upload" className="btn btn-primary btn-sm">
            <Upload size={15} /> Upload Your First Resource
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {uploads.map(m => (
            <div key={m.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px' }}>
                  <div className="material-card-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary">{m.materialType?.name || 'Document'}</span>
                      {m.status === 'approved' && (
                        <span className="badge badge-success"><CheckCircle2 size={12} /> Approved</span>
                      )}
                      {m.status === 'pending' && (
                        <span className="badge badge-warning"><Clock size={12} /> Pending Review</span>
                      )}
                      {m.status === 'rejected' && (
                        <span className="badge badge-danger"><AlertCircle size={12} /> Rejected</span>
                      )}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {m.course?.code}
                      </span>
                    </div>

                    <Link to={`/material/${m.id}`} style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                      {m.title}
                    </Link>

                    {m.status === 'rejected' && m.rejectionReason && (
                      <div style={{
                        padding: '0.6rem 0.85rem',
                        background: 'var(--accent-rose-light)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--accent-rose)',
                        fontSize: '0.85rem',
                        marginTop: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <strong>Feedback from moderator:</strong> {m.rejectionReason}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      <span>Size: {m.formattedSize || '2.1 MB'}</span>
                      <span>Downloads: {m.downloadCount || 0}</span>
                      <span>Uploaded on: {new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Link to={`/material/${m.id}`} className="btn btn-secondary btn-sm" title="View details">
                    <ExternalLink size={14} /> View
                  </Link>
                  <Link to={`/upload?edit=${m.id}`} className="btn btn-secondary btn-sm" title="Edit">
                    <Edit3 size={14} /> Edit
                  </Link>
                  <button onClick={() => confirmDelete(m)} className="btn btn-danger btn-sm" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Are you sure you want to remove <strong>{selectedMaterial?.title}</strong>? This resource will no longer be accessible by students.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={() => setDeleteModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting} className="btn btn-danger">
            {deleting ? 'Deleting...' : 'Delete Material'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
