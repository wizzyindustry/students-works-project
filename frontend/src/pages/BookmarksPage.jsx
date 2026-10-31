import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, FileText } from 'lucide-react';
import { api } from '../services/api.js';
import { MaterialCard } from '../components/common/MaterialCard.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const res = await api.getBookmarks();
      setBookmarks(res.bookmarks || []);
    } catch {
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = (materialId, isNowBookmarked) => {
    if (!isNowBookmarked) {
      setBookmarks(prev => prev.filter(b => b.material?.id !== materialId));
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>My Saved Bookmarks</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Quick access to your curated study guides, lecture slides, and past papers
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '36px', height: '36px' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading bookmarks...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Bookmark size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No bookmarked materials yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Click the bookmark icon on any material card to save it here for fast revision before your exams.
          </p>
          <Link to="/search" className="btn btn-primary btn-sm">
            <Compass size={15} /> Discover Materials
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {bookmarks.map(b => (
            <MaterialCard
              key={b.id || b.material?.id}
              material={b.material}
              isBookmarked={true}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
