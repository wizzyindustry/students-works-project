import React, { createContext, useContext, useState } from 'react';
import { Download, CheckCircle2, FileText, X } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from './ToastContext.jsx';
import confetti from 'canvas-confetti';

const DownloadContext = createContext();

export function DownloadProvider({ children }) {
  const [activeDownload, setActiveDownload] = useState(null);
  const toast = useToast();

  const startDownload = async (material) => {
    if (!material) return;

    setActiveDownload({
      material,
      progress: 10,
      phaseText: 'Contacting academic file storage...',
      completed: false
    });

    try {
      // Phase 1: Contacting server
      await new Promise(r => setTimeout(r, 250));
      setActiveDownload(prev => prev ? {
        ...prev,
        progress: 45,
        phaseText: `Streaming ${material.fileName || material.title}...`
      } : null);

      // Phase 2: Fetching blob
      const blobPromise = api.downloadMaterial(material.id);

      await new Promise(r => setTimeout(r, 300));
      setActiveDownload(prev => prev ? {
        ...prev,
        progress: 85,
        phaseText: 'Verifying file integrity...'
      } : null);

      const blob = await blobPromise;

      // Phase 3: Trigger file save
      setActiveDownload(prev => prev ? {
        ...prev,
        progress: 100,
        phaseText: 'Download Complete! Happy Studying.',
        completed: true
      } : null);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.fileName || `${material.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.85 }
      });

      // Auto dismiss after 3 seconds
      setTimeout(() => {
        setActiveDownload(null);
      }, 3500);

    } catch (err) {
      toast.error(err.message || 'Download failed');
      setActiveDownload(null);
    }
  };

  const dismissDownload = () => {
    setActiveDownload(null);
  };

  return (
    <DownloadContext.Provider value={{ startDownload }}>
      {children}

      {/* Floating Download Indicator */}
      {activeDownload && (
        <div className="download-pill-floater" role="status" aria-live="polite">
          <div className="download-pill-icon">
            {activeDownload.completed ? (
              <CheckCircle2 size={24} color="var(--accent-emerald)" />
            ) : (
              <Download size={22} className="download-arrow-anim" />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontWeight: 700, 
              fontSize: '0.925rem', 
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {activeDownload.material.title}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {activeDownload.phaseText}
            </div>

            <div className="progress-track" style={{ height: '6px', margin: '6px 0 0' }}>
              <div 
                className="progress-fill-animated" 
                style={{ 
                  width: `${activeDownload.progress}%`,
                  background: activeDownload.completed ? 'var(--accent-emerald)' : 'var(--gradient-brand)'
                }} 
              />
            </div>
          </div>

          <button
            onClick={dismissDownload}
            style={{ 
              color: 'var(--text-muted)', 
              padding: '4px', 
              borderRadius: 'var(--radius-sm)', 
              display: 'flex',
              alignSelf: 'flex-start'
            }}
            aria-label="Dismiss download notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </DownloadContext.Provider>
  );
}

export function useDownload() {
  const context = useContext(DownloadContext);
  if (!context) throw new Error('useDownload must be used within DownloadProvider');
  return context;
}
