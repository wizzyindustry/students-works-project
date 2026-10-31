import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';

// Pages
import { HomePage } from './pages/HomePage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { BrowsePage } from './pages/BrowsePage.jsx';
import { SearchPage } from './pages/SearchPage.jsx';
import { MaterialDetailPage } from './pages/MaterialDetailPage.jsx';
import { UploadPage } from './pages/UploadPage.jsx';
import { MyUploadsPage } from './pages/MyUploadsPage.jsx';
import { BookmarksPage } from './pages/BookmarksPage.jsx';
import { DownloadsPage } from './pages/DownloadsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx';
import { AdminMaterialsPage } from './pages/admin/AdminMaterialsPage.jsx';
import { AdminReportsPage } from './pages/admin/AdminReportsPage.jsx';
import { AdminAcademicPage } from './pages/admin/AdminAcademicPage.jsx';

function NotFoundPage() {
  return (
    <div className="glass-card" style={{ maxWidth: '520px', margin: '4rem auto', padding: '3.5rem 2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
        The academic resource or page you are looking for does not exist or was moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/material/:id" element={<MaterialDetailPage />} />

        {/* Authenticated Student Routes */}
        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        } />
        <Route path="/my-uploads" element={
          <ProtectedRoute>
            <MyUploadsPage />
          </ProtectedRoute>
        } />
        <Route path="/bookmarks" element={
          <ProtectedRoute>
            <BookmarksPage />
          </ProtectedRoute>
        } />
        <Route path="/downloads" element={
          <ProtectedRoute>
            <DownloadsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly={true}>
            <AdminUsersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/materials" element={
          <ProtectedRoute adminOnly={true}>
            <AdminMaterialsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute adminOnly={true}>
            <AdminReportsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/academic" element={
          <ProtectedRoute adminOnly={true}>
            <AdminAcademicPage />
          </ProtectedRoute>
        } />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
