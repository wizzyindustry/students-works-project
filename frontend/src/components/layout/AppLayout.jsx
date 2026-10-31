import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Footer } from './Footer.jsx';
import { PageProgressBar } from '../common/PageProgressBar.jsx';
import { ScrollToTopButton } from '../common/ScrollToTopButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isHomePage = location.pathname === '/';

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  if (isAuthPage) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <PageProgressBar />
        <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
          <div key={location.pathname} className="page-transition" style={{ width: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <PageProgressBar />
      <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

      <div className="main-layout">
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        )}

        <div className="content-wrapper">
          <main style={{ flex: 1 }}>
            <div key={location.pathname} className="page-transition">
              <Outlet />
            </div>
          </main>
          {isHomePage && <Footer />}
        </div>
      </div>

      {!isHomePage && <Footer />}
      <ScrollToTopButton />
    </div>
  );
}
