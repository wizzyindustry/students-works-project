import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Upload, 
  Download, 
  Compass, 
  FileCheck, 
  Users, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  Star,
  Award,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api.js';
import { MaterialCard } from '../components/common/MaterialCard.jsx';
import { StatCard } from '../components/common/StatCard.jsx';

export function HomePage() {
  const [stats, setStats] = useState({
    approvedMaterials: 1420,
    totalDownloads: 18450,
    activeStudents: 3200,
    coursesCount: 180
  });
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [statsData, materialsData] = await Promise.all([
          api.getMaterialsStats().catch(() => null),
          api.getMaterials({ limit: 6, sortBy: 'created_at' }).catch(() => null)
        ]);

        if (statsData?.stats) {
          setStats({
            approvedMaterials: statsData.stats.materials?.approved || 1420,
            totalDownloads: statsData.stats.materials?.totalDownloads || 18450,
            activeStudents: statsData.stats.users?.students || 3200,
            coursesCount: 180
          });
        }

        if (materialsData?.materials) {
          setRecentMaterials(materialsData.materials.slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Hero Section */}
      <section className="hero-gradient-bg">
        <div className="hero-glow-blob" style={{ top: '-100px', right: '-80px' }} />
        <div className="hero-glow-blob" style={{ bottom: '-120px', left: '-60px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(99, 102, 241, 0) 70%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.25)', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            <Sparkles size={16} /> Empowering University Students Across Campuses
          </div>

          <h1 style={{ fontSize: 'clamp(2.3rem, 5vw, 3.6rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Academic Resources, Notes &amp; Exams <br />
            <span className="hero-gradient-text">Shared by Students, for Students</span>
          </h1>

          <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.25rem', maxWidth: '680px', margin: '0 auto 2.25rem' }}>
            Discover, download, and contribute verified lecture slides, past university examination papers, assignment tutorials, and comprehensive study notes organized by program and semester.
          </p>

          {/* Large Hero Search */}
          <form onSubmit={handleSearch} style={{ maxWidth: '620px', margin: '0 auto 1.75rem', position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-full)',
              padding: '0.5rem 0.6rem 0.5rem 1.4rem',
              boxShadow: 'var(--shadow-xl)',
              border: '1.5px solid var(--border-subtle)',
              gap: '0.75rem'
            }}>
              <Search size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by course code (e.g. CS211), title, or topic..."
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  color: 'var(--text-primary)'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0.7rem 1.6rem' }}>
                Search
              </button>
            </div>
          </form>

          {/* Quick Action Links */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/browse" className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)' }}>
              <Compass size={18} /> Browse by College &amp; Course
            </Link>
            <Link to="/upload" className="btn btn-secondary" style={{ borderRadius: 'var(--radius-full)' }}>
              <Upload size={18} /> Share Your Notes
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Row */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <StatCard
            title="Approved Materials"
            value={Number(stats.approvedMaterials).toLocaleString()}
            subtitle="Verified by faculty & peers"
            icon={FileCheck}
            color="var(--accent-emerald)"
            bgLight="var(--accent-emerald-light)"
          />
          <StatCard
            title="Total Downloads"
            value={Number(stats.totalDownloads).toLocaleString()}
            subtitle="Academic resources delivered"
            icon={Download}
            color="var(--primary)"
            bgLight="var(--primary-light)"
          />
          <StatCard
            title="Active Scholars"
            value={Number(stats.activeStudents).toLocaleString()}
            subtitle="Registered university students"
            icon={Users}
            color="var(--accent-amber)"
            bgLight="var(--accent-amber-light)"
          />
          <StatCard
            title="Courses Covered"
            value={`${stats.coursesCount}+`}
            subtitle="Spanning multiple faculties"
            icon={BookOpen}
            color="var(--secondary)"
            bgLight="var(--secondary-light)"
          />
        </div>
      </section>

      {/* Platform Features Grid */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            Built for Serious Academic Success
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Everything students need to prepare for quizzes, midterms, and final examinations in one structured repository.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          <div className="glass-card interactive" style={{ padding: '2rem' }}>
            <div className="material-card-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '1.25rem' }}>
              <Compass size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem' }}>Structured Hierarchy</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Materials are neatly indexed by University &rarr; College &rarr; Degree Program &rarr; Year of Study &rarr; Semester &rarr; Course Code. No more digging through unorganized chat groups.
            </p>
          </div>

          <div className="glass-card interactive" style={{ padding: '2rem' }}>
            <div className="material-card-icon" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', marginBottom: '1.25rem' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem' }}>Past Examination Papers</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Practice with real past tests, end-of-semester papers, and tutorial marking guides with solutions uploaded by high-achieving classmates.
            </p>
          </div>

          <div className="glass-card interactive" style={{ padding: '2rem' }}>
            <div className="material-card-icon" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)', marginBottom: '1.25rem' }}>
              <Star size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem' }}>Ratings &amp; Quality Control</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Community ratings, reviews, and admin verification guarantee that you only spend time on high-quality, accurate, and relevant study resources.
            </p>
          </div>
        </div>
      </section>

      {/* Featured / Recent Materials Preview */}
      {recentMaterials.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Recent Academic Materials</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Freshly uploaded notes and papers ready for instant download</p>
            </div>
            <Link to="/search" className="btn btn-outline btn-sm">
              View All Materials <ArrowRight size={15} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {recentMaterials.map(m => (
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>
        </section>
      )}

      {/* Call to Action Banner */}
      <section style={{
        background: 'var(--gradient-brand)',
        borderRadius: 'var(--radius-xl)',
        padding: '3.5rem 2rem',
        color: 'white',
        textAlign: 'center',
        boxShadow: 'var(--shadow-xl)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '2.2rem', color: 'white', marginBottom: '1rem' }}>
          Ready to Ace Your Next Examination?
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
          Create your free student account or explore available materials right now.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }}>
            Join Free as Student
          </Link>
          <Link to="/browse" className="btn" style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.35)' }}>
            Browse Courses First
          </Link>
        </div>
      </section>
    </div>
  );
}
