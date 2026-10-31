import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  Sun, 
  Moon, 
  Upload, 
  User, 
  Bookmark, 
  Download, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated && (
          <button 
            onClick={onToggleSidebar}
            className="btn-ghost"
            style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
            aria-label="Toggle navigation sidebar"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <GraduationCap size={24} />
          </div>
          <span>Scholar<span style={{ color: 'var(--primary)' }}>Hub</span></span>
        </Link>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'none' }} className="d-md-flex">
        <div className="nav-search-box">
          <Search size={15} />
          <input 
            type="text" 
            placeholder="Search notes, exams..." 
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            style={{ 
              background: 'none', 
              border: 'none', 
              outline: 'none', 
              fontSize: '0.85rem',
              width: '130px',
              color: 'inherit'
            }}
          />
          <kbd>↵</kbd>
        </div>
      </form>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={toggleTheme} 
          className="btn-ghost" 
          style={{ padding: '8px', borderRadius: 'var(--radius-full)' }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} />}
        </button>

        {isAuthenticated ? (
          <>
            <Link to="/upload" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
              <Upload size={15} />
              <span className="d-none d-sm-inline">Upload</span>
            </Link>

            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="user-menu-btn"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="user-avatar-sm">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="d-none d-md-inline" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {user?.fullName?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-header-name">{user?.fullName || 'Scholar'}</div>
                    <div className="dropdown-header-email">{user?.email || ''}</div>
                    {isAdmin && (
                      <span className="badge badge-primary" style={{ marginTop: '6px' }}>
                        <ShieldCheck size={12} /> Administrator
                      </span>
                    )}
                  </div>

                  <Link to="/profile" className="dropdown-item">
                    <User size={16} /> Profile
                  </Link>
                  <Link to="/my-uploads" className="dropdown-item">
                    <Upload size={16} /> My Uploads
                  </Link>
                  <Link to="/bookmarks" className="dropdown-item">
                    <Bookmark size={16} /> Bookmarks
                  </Link>
                  <Link to="/downloads" className="dropdown-item">
                    <Download size={16} /> Downloads
                  </Link>

                  {isAdmin && (
                    <>
                      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.35rem 0' }} />
                      <Link to="/admin" className="dropdown-item" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        <ShieldCheck size={16} /> Admin Portal
                      </Link>
                    </>
                  )}

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.35rem 0' }} />
                  <button onClick={logout} className="dropdown-item danger">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
