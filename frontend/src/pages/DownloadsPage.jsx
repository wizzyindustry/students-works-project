import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, ExternalLink, Calendar, BookOpen } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import confetti from 'canvas-confetti';

export function DownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    setLoading(true);
    try {
      const res = await api.getDownloadHistory();
      setDownloads(res.downloads || []);
    } catch {
      toast.error('Failed to load download history');
    } finally {
      setLoading(false);
    }
  };

  const handleReDownload = async (mat) => {
    try {
      const blob = await api.downloadMaterial(mat.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mat.fileName || `${mat.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      toast.success('Downloaded file again');
    } catch {
      toast.error('Re-download failed');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>Download History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Record of academic papers and notes you've retrieved
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '36px', height: '36px' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading downloads...</p>
        </div>
      ) : downloads.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Download size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No downloads on record yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Whenever you download lecture notes or exam solutions, they will appear here for fast re-downloading.
          </p>
          <Link to="/search" className="btn btn-primary btn-sm">
            Browse Academic Materials
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Course</th>
                <th>Downloaded At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {downloads.map(d => {
                const mat = d.material || {};
                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText size={18} color="var(--primary)" />
                        <div>
                          <Link to={`/material/${mat.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {mat.title}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {mat.formattedSize || '2.2 MB'} • {mat.materialType?.name || 'Notes'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">
                        {mat.course?.code || 'Course'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(d.downloadedAt).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleReDownload(mat)}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '4px' }}
                      >
                        <Download size={13} /> Re-download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
