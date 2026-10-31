import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  X, 
  Upload, 
  FileText, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api.js';
import { MaterialCard } from '../components/common/MaterialCard.jsx';
import { Pagination } from '../components/common/Pagination.jsx';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCourseId = searchParams.get('courseId') || '';
  const initialCourseName = searchParams.get('courseName') || '';
  const initialType = searchParams.get('type') || '';

  const [search, setSearch] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState('grid');
  const [courseFilter, setCourseFilter] = useState({ id: initialCourseId, name: initialCourseName });

  const [materialTypes, setMaterialTypes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 12;

  // Load material types
  useEffect(() => {
    async function fetchTypes() {
      try {
        const res = await api.getMaterialTypes();
        if (res.types) setMaterialTypes(res.types);
      } catch (e) {
        console.error(e);
      }
    }
    fetchTypes();
  }, []);

  // Fetch materials whenever filters change
  useEffect(() => {
    async function fetchMaterials() {
      setLoading(true);
      try {
        const offset = (currentPage - 1) * limit;
        const res = await api.getMaterials({
          search: search.trim() || undefined,
          materialTypeId: selectedType || undefined,
          academicYear: selectedYear || undefined,
          courseId: courseFilter.id || undefined,
          sortBy,
          limit,
          offset
        });
        setMaterials(res.materials || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error(err);
        setMaterials([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchMaterials, 200);
    return () => clearTimeout(timer);
  }, [search, selectedType, selectedYear, sortBy, courseFilter.id, currentPage]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedType('');
    setSelectedYear('');
    setCourseFilter({ id: '', name: '' });
    setSearchParams({});
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Explore Academic Materials</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Search verified lecture notes, exam papers, solutions, and laboratory manuals
          </p>
        </div>
        <Link to="/upload" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
          <Upload size={15} /> Upload Resource
        </Link>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          {/* Search Box */}
          <div style={{ gridColumn: 'span 2', minWidth: '260px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Keyword or Course</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by title, topic, course code..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ paddingLeft: '2.4rem', paddingRight: search ? '2.4rem' : '1rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Resource Type</label>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Types</option>
              {materialTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Academic Year</label>
            <select
              className="form-select"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Years</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
              <option value="2021-2022">2021-2022</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Sort By</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="created_at">Newest First</option>
              <option value="download_count">Most Downloaded</option>
              <option value="average_rating">Highest Rated</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {(search || selectedType || selectedYear || courseFilter.name) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active filters:</span>
            {courseFilter.name && (
              <span className="badge badge-primary">
                Course: {courseFilter.name}
                <X size={12} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => setCourseFilter({ id: '', name: '' })} />
              </span>
            )}
            {selectedType && (
              <span className="badge badge-secondary">
                Type: {materialTypes.find(t => t.id === selectedType)?.name}
                <X size={12} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => setSelectedType('')} />
              </span>
            )}
            {selectedYear && (
              <span className="badge badge-secondary">
                Year: {selectedYear}
                <X size={12} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => setSelectedYear('')} />
              </span>
            )}
            {search && (
              <span className="badge badge-secondary">
                Query: "{search}"
                <X size={12} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => setSearch('')} />
              </span>
            )}
            <button
              onClick={handleClearFilters}
              style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', textDecoration: 'underline', marginLeft: 'auto', cursor: 'pointer' }}
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Results Header: Count & View Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Found <strong>{total}</strong> {total === 1 ? 'material' : 'materials'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-muted)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setViewMode('grid')}
            className={`btn-ghost ${viewMode === 'grid' ? 'active' : ''}`}
            style={{
              padding: '5px 8px',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none'
            }}
            aria-label="Grid view"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`btn-ghost ${viewMode === 'list' ? 'active' : ''}`}
            style={{
              padding: '5px 8px',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'list' ? 'var(--shadow-xs)' : 'none'
            }}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Results Container */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '36px', height: '36px' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Searching materials...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No materials match your query</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Try adjusting your filters, searching with different terms, or contribute the first material for this course!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={handleClearFilters} className="btn btn-secondary btn-sm">
              Clear All Filters
            </button>
            <Link to="/upload" className="btn btn-primary btn-sm">
              <Upload size={15} /> Upload Material
            </Link>
          </div>
        </div>
      ) : (
        <div style={
          viewMode === 'grid'
            ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }
            : { display: 'flex', flexDirection: 'column' }
        }>
          {materials.map(m => (
            <MaterialCard
              key={m.id}
              material={m}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
      />
    </div>
  );
}
