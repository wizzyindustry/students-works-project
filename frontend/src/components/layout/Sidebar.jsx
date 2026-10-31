import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  Upload, 
  FileText, 
  Bookmark, 
  Download, 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  Flag, 
  Building2, 
  User, 
  Settings 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop d-lg-none" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-section">
          <div className="sidebar-title">Explore</div>
          <NavLink 
            to="/browse" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Compass size={18} />
            <span>Browse Courses</span>
          </NavLink>
          <NavLink 
            to="/search" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Search size={18} />
            <span>Search Materials</span>
          </NavLink>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Workspace</div>
          <NavLink 
            to="/upload" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Upload size={18} />
            <span>Upload New</span>
          </NavLink>
          <NavLink 
            to="/my-uploads" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <FileText size={18} />
            <span>My Uploads</span>
          </NavLink>
          <NavLink 
            to="/bookmarks" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Bookmark size={18} />
            <span>Bookmarks</span>
          </NavLink>
          <NavLink 
            to="/downloads" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Download size={18} />
            <span>Download History</span>
          </NavLink>
        </div>

        {isAdmin && (
          <div className="sidebar-section">
            <div className="sidebar-title">Administration</div>
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={18} />
              <span>Admin Dashboard</span>
            </NavLink>
            <NavLink 
              to="/admin/materials" 
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <FileCheck size={18} />
              <span>Moderate Materials</span>
            </NavLink>
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Users size={18} />
              <span>Manage Users</span>
            </NavLink>
            <NavLink 
              to="/admin/reports" 
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Flag size={18} />
              <span>Flagged Reports</span>
            </NavLink>
            <NavLink 
              to="/admin/academic" 
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Building2 size={18} />
              <span>Academic Structure</span>
            </NavLink>
          </div>
        )}

        <div className="sidebar-section" style={{ marginTop: 'auto', marginBottom: 0 }}>
          <div className="sidebar-title">Preferences</div>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <User size={18} />
            <span>My Profile</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
