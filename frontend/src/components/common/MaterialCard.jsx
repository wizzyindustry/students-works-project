import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Bookmark, 
  BookOpen, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { RatingStars } from './RatingStars.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import confetti from 'canvas-confetti';

export function MaterialCard({ 
  material, 
  viewMode = 'grid', 
  onBookmarkToggle,
  isBookmarked = false,
  showStatus = false 
}) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [downloading, setDownloading] = useState(false);
  const toast = useToast();

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.toggleBookmark(material.id);
      setBookmarked(!bookmarked);
      toast.success(res.message || 'Bookmark updated');
      if (onBookmarkToggle) onBookmarkToggle(material.id, !bookmarked);
    } catch {
      toast.error('Could not update bookmark');
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 }
      });
      toast.success('Download started!');
    } catch (err) {
      toast.error(err.message || 'Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusBadge = () => {
    if (material.status === 'approved') {
      return (
        <span className="badge badge-success">
          <CheckCircle2 size={12} /> Approved
        </span>
      );
    }
    if (material.status === 'pending') {
      return (
        <span className="badge badge-warning">
          <Clock size={12} /> Pending Review
        </span>
      );
    }
    if (material.status === 'rejected') {
      return (
        <span className="badge badge-danger">
          <AlertCircle size={12} /> Rejected
        </span>
      );
    }
    return null;
  };

  if (viewMode === 'list') {
    return (
      <div className="glass-card interactive" style={{ padding: '1.25rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '260px' }}>
            <div 
              className="material-card-icon"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
            >
              <FileText size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{material.materialType?.name || 'Resource'}</span>
                {showStatus && getStatusBadge()}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {material.course?.code}
                </span>
              </div>
              <Link 
                to={`/material/${material.id}`}
                style={{ 
                  fontWeight: 700, 
                  color: 'var(--text-primary)', 
                  fontSize: '1.025rem',
                  display: 'block'
                }}
              >
                {material.title}
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ textAlign: 'right', display: 'none', minWidth: '90px' }} className="d-md-block">
              <RatingStars rating={material.averageRating || 0} size={14} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {material.downloadCount || 0} downloads
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                onClick={handleBookmark}
                className="btn-ghost" 
                style={{ 
                  padding: '8px', 
                  borderRadius: 'var(--radius-md)', 
                  color: bookmarked ? 'var(--primary)' : 'var(--text-muted)' 
                }}
                title={bookmarked ? 'Remove bookmark' : 'Bookmark resource'}
              >
                <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
              
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="btn btn-secondary btn-sm"
                title="Download resource"
              >
                <Download size={15} />
                <span>{downloading ? '...' : (material.formattedSize || 'Download')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="material-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-primary">
            {material.materialType?.name || 'Notes'}
          </span>
          {showStatus && getStatusBadge()}
        </div>
        <button 
          onClick={handleBookmark}
          className="btn-ghost"
          style={{ 
            padding: '4px', 
            borderRadius: 'var(--radius-sm)',
            color: bookmarked ? 'var(--primary)' : 'var(--text-muted)'
          }}
          aria-label="Bookmark"
        >
          <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div style={{ marginBottom: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
          <BookOpen size={14} />
          <span>{material.course?.code} — {material.course?.name}</span>
        </div>

        <Link 
          to={`/material/${material.id}`} 
          style={{ 
            fontSize: '1.05rem', 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '0.65rem'
          }}
        >
          {material.title}
        </Link>

        {material.description && (
          <p style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)', 
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            {material.description}
          </p>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <RatingStars rating={material.averageRating || 0} size={15} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download size={13} /> {material.downloadCount || 0}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={13} /> {material.uploader?.fullName || 'Student'}
          </span>
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600 }}
          >
            <Download size={14} />
            <span>{downloading ? '...' : (material.formattedSize || 'Get File')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
