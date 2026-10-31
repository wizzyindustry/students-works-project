import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Bookmark, 
  Star, 
  Flag, 
  ArrowLeft, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  Building, 
  User, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Edit3,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { RatingStars } from '../components/common/RatingStars.jsx';
import { Modal } from '../components/common/Modal.jsx';
import confetti from 'canvas-confetti';

export function MaterialDetailPage() {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Rate Modal state
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('inappropriate');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMaterial() {
      setLoading(true);
      try {
        const data = await api.getMaterial(id);
        if (data.material) {
          setMaterial(data.material);
        }
      } catch (err) {
        toast.error('Resource not found or failed to load');
      } finally {
        setLoading(false);
      }
    }
    loadMaterial();
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await api.downloadMaterial(material.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.fileName || `${material.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 }
      });
      toast.success('Download started!');
      setMaterial(prev => ({ ...prev, downloadCount: (prev.downloadCount || 0) + 1 }));
    } catch (err) {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await api.toggleBookmark(material.id);
      setBookmarked(!bookmarked);
      toast.success(res.message);
    } catch {
      toast.error('Failed to toggle bookmark');
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRating(true);
    try {
      await api.rateMaterial(material.id, userRating, userComment);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      toast.success('Thank you for rating this resource!');
      setRateModalOpen(false);
      setUserComment('');
    } catch (err) {
      toast.error(err.message || 'Rating failed');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      await api.reportMaterial(material.id, reportReason, reportDescription);
      toast.success('Report submitted to administrators for review.');
      setReportModalOpen(false);
      setReportDescription('');
    } catch (err) {
      toast.error(err.message || 'Report failed');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteMaterial(material.id);
      toast.success('Resource deleted successfully');
      navigate('/browse');
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '40px', height: '40px' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading resource details...</p>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="glass-card" style={{ maxWidth: '600px', margin: '3rem auto', padding: '3rem', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: 'var(--accent-amber)', marginBottom: '1rem' }} />
        <h2>Material Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          This resource might have been removed or moderated.
        </p>
        <Link to="/search" className="btn btn-primary">
          Browse Other Resources
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === material.uploader?.id;
  const canManage = isOwner || isAdmin;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to search
        </button>
      </div>

      <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        {/* Top Badges & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">
              <FileText size={13} /> {material.materialType?.name || 'Academic Notes'}
            </span>
            <span className="badge badge-secondary">
              {material.formattedSize || '2.4 MB'}
            </span>
            {material.status === 'approved' && (
              <span className="badge badge-success">
                <CheckCircle2 size={12} /> Verified &amp; Approved
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={handleShare} className="btn btn-secondary btn-sm" title="Share link">
              <Share2 size={15} />
            </button>
            <button onClick={handleToggleBookmark} className="btn btn-secondary btn-sm" title={bookmarked ? 'Remove bookmark' : 'Bookmark'}>
              <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} color={bookmarked ? 'var(--primary)' : 'inherit'} />
            </button>
            <button onClick={() => setReportModalOpen(true)} className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-rose)' }} title="Report inappropriate content">
              <Flag size={15} /> Report
            </button>
            {canManage && (
              <>
                <Link to={`/upload?edit=${material.id}`} className="btn btn-secondary btn-sm" title="Edit details">
                  <Edit3 size={15} />
                </Link>
                <button onClick={() => setDeleteModalOpen(true)} className="btn btn-danger btn-sm" title="Delete">
                  <Trash2 size={15} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          {material.title}
        </h1>

        {material.description && (
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', whiteSpace: 'pre-line' }}>
            {material.description}
          </p>
        )}

        {/* Academic Hierarchy Context Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
          background: 'var(--bg-muted)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={13} /> Course
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {material.course?.code} — {material.course?.name}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <GraduationCap size={13} /> Program
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {material.program?.name || 'Computer Science'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building size={13} /> University
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {material.university?.name || 'University of Dodoma'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} /> Academic Term
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {material.academicYear || '2024-2025'} • Semester {material.semester || 1}
            </div>
          </div>
        </div>

        {/* Download & Rating Action Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <RatingStars rating={material.averageRating || 5} size={18} />
              <button
                onClick={() => setRateModalOpen(true)}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--primary)', fontWeight: 600, padding: '2px 6px', fontSize: '0.85rem' }}
              >
                Rate this resource
              </button>
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Based on {material.ratingsCount || 12} community reviews • {material.downloadCount || 0} total downloads
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn btn-primary btn-lg"
            style={{ minWidth: '220px', gap: '8px' }}
          >
            <Download size={20} />
            <span>{downloading ? 'Downloading...' : 'Download Document'}</span>
          </button>
        </div>
      </div>

      {/* Rate Modal */}
      <Modal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        title="Rate &amp; Review Resource"
      >
        <form onSubmit={handleRateSubmit}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Select a star rating to help other students find quality materials:
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RatingStars
                rating={userRating}
                interactive={true}
                size={32}
                onRate={(val) => setUserRating(val)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Review Comment (Optional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="How helpful was this resource for your course or exam preparation?"
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setRateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submittingRating} className="btn btn-primary">
              {submittingRating ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Material"
      >
        <form onSubmit={handleReportSubmit}>
          <div className="form-group">
            <label className="form-label">Reason for reporting</label>
            <select
              className="form-select"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="inappropriate">Inappropriate or Offensive Content</option>
              <option value="copyright">Copyright Infringement / Unauthorized Book</option>
              <option value="incorrect">Significantly Inaccurate or Misleading Answers</option>
              <option value="wrong_course">Wrong Course or Duplicate Upload</option>
              <option value="spam">Spam or Irrelevant File</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Details &amp; Specifics</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="Describe what is wrong with this document so moderators can investigate..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setReportModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submittingReport} className="btn btn-danger">
              {submittingReport ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete Resource"
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Are you sure you want to permanently delete <strong>{material.title}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={() => setDeleteModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting} className="btn btn-danger">
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
