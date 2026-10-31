import React from 'react';
import { UploadCloud, CheckCircle2, FileText, Sparkles } from 'lucide-react';

export function UploadProgressModal({ isOpen, progress, phaseText, isCompleted, fileName }) {
  if (!isOpen) return null;

  return (
    <div className="upload-progress-overlay" role="dialog" aria-modal="true">
      <div className="upload-progress-card">
        <div className="upload-icon-pulse">
          {isCompleted ? (
            <CheckCircle2 size={40} />
          ) : (
            <UploadCloud size={40} />
          )}
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
          {isCompleted ? 'Resource Uploaded!' : 'Uploading Document...'}
        </h3>

        {fileName && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
            <FileText size={15} />
            <span style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fileName}
            </span>
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          {phaseText}
        </p>

        {/* Progress Bar */}
        <div className="progress-track">
          <div 
            className="progress-fill-animated"
            style={{ 
              width: `${progress}%`,
              background: isCompleted ? 'var(--accent-emerald)' : 'var(--gradient-brand)'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          <span>Transfer Progress</span>
          <span style={{ color: 'var(--primary)' }}>{progress}%</span>
        </div>

        {isCompleted && (
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '0.875rem', fontWeight: 600 }}>
            <Sparkles size={16} /> Redirecting to your uploads...
          </div>
        )}
      </div>
    </div>
  );
}
