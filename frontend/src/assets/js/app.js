export class App {
  constructor() {
    this.currentPage = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    
    this.setupEventListeners();
    this.checkAuthState();
    this.render();
    this.isInitialized = true;
  }

  setupEventListeners() {
    // Handle navigation links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          window.router.navigate(href);
        }
      }

      // Handle logout
      if (e.target.matches('[data-action="logout"]')) {
        e.preventDefault();
        window.auth.logout();
      }

      // Handle mobile menu toggle
      if (e.target.matches('[data-action="toggle-menu"]') || e.target.closest('[data-action="toggle-menu"]')) {
        this.toggleMobileMenu();
      }

      // Handle sidebar overlay click
      if (e.target.matches('.sidebar-overlay')) {
        this.closeMobileMenu();
      }
    });

    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
        window.modal.close();
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.render();
    });
  }

  checkAuthState() {
    const token = window.storage.get('accessToken');
    const user = window.storage.get('user');
    
    if (token && user) {
      window.auth.setAuth(token, user);
    }
  }

  toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && overlay) {
      sidebar.classList.toggle('show');
      overlay.classList.toggle('show');
      document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : '';
    }
  }

  closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && overlay) {
      sidebar.classList.remove('show');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  async render() {
    const path = window.location.pathname;
    const appContainer = document.getElementById('app');
    
    if (!appContainer) return;

    try {
      // Show loading state
      appContainer.innerHTML = this.getLoadingHTML();
      
      // Get page component
      const page = window.router.resolve(path);
      
      if (!page) {
        appContainer.innerHTML = this.getNotFoundHTML();
        return;
      }

      // Check authentication requirements
      if (page.requiresAuth && !window.auth.isAuthenticated()) {
        window.router.navigate('/login?redirect=' + encodeURIComponent(path));
        return;
      }

      if (page.requiresAdmin && !window.auth.isAdmin()) {
        window.router.navigate('/');
        window.toast.error('Admin access required');
        return;
      }

      // Render layout with page content
      const layout = this.getLayoutHTML(page);
      appContainer.innerHTML = layout;

      // Initialize page-specific logic
      if (page.init) {
        await page.init();
      }

      this.currentPage = page;
      this.closeMobileMenu();

    } catch (error) {
      console.error('Render error:', error);
      appContainer.innerHTML = this.getErrorHTML(error.message);
    }
  }

  getLayoutHTML(page) {
    const user = window.auth.getUser();
    const isAuthenticated = window.auth.isAuthenticated();
    const isAdmin = window.auth.isAdmin();

    return `
      <header class="header" role="banner">
        <div class="container-fluid">
          <a href="/" class="logo" data-link>
            <i class="bi bi-book-half"></i>
            <span>Student Materials</span>
          </a>
          
          <nav class="navbar-nav" role="navigation" aria-label="Main navigation">
            ${isAuthenticated ? `
              <a href="/browse" class="nav-link" data-link>Browse</a>
              <a href="/search" class="nav-link" data-link>Search</a>
              ${isAdmin ? '<a href="/admin" class="nav-link" data-link>Admin</a>' : ''}
            ` : `
              <a href="/login" class="nav-link" data-link>Login</a>
              <a href="/register" class="nav-link" data-link>Register</a>
            `}
          </nav>

          <div class="user-menu">
            ${isAuthenticated ? `
              <button class="user-menu-toggle" aria-label="User menu" aria-expanded="false" aria-haspopup="true">
                <div class="user-avatar" aria-hidden="true">
                  ${user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span class="user-name">${this.escapeHtml(user?.fullName || 'User')}</span>
                <i class="bi bi-chevron-down" style="font-size: 0.75rem;"></i>
              </button>
              <div class="user-menu-dropdown" role="menu">
                <div class="dropdown-header">
                  <div>${this.escapeHtml(user?.fullName || 'User')}</div>
                  <div class="user-email">${this.escapeHtml(user?.email || '')}</div>
                </div>
                <a href="/profile" class="dropdown-item" data-link role="menuitem">
                  <i class="bi bi-person"></i> Profile
                </a>
                <a href="/my-uploads" class="dropdown-item" data-link role="menuitem">
                  <i class="bi bi-upload"></i> My Uploads
                </a>
                <a href="/bookmarks" class="dropdown-item" data-link role="menuitem">
                  <i class="bi bi-bookmark"></i> Bookmarks
                </a>
                <a href="/downloads" class="dropdown-item" data-link role="menuitem">
                  <i class="bi bi-download"></i> Downloads
                </a>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" data-action="logout" role="menuitem" style="width: 100%; text-align: left; background: none; border: none; cursor: pointer;">
                  <i class="bi bi-box-arrow-right"></i> Logout
                </button>
              </div>
            ` : ''}
            <button class="mobile-menu-btn" data-action="toggle-menu" aria-label="Toggle menu" aria-expanded="false">
              <i class="bi bi-list" style="font-size: 1.25rem;"></i>
            </button>
          </div>
        </div>
      </header>

      <div class="sidebar-overlay" aria-hidden="true"></div>
      
      <aside class="sidebar" role="complementary" aria-label="Sidebar navigation">
        <nav class="sidebar-nav" aria-label="Section navigation">
          ${this.getSidebarNavHTML()}
        </nav>
      </aside>

      <main class="content" role="main" id="main-content">
        ${page.template ? page.template() : ''}
      </main>

      <footer class="footer" role="contentinfo">
        <div class="container-fluid text-center text-muted small">
          &copy; ${new Date().getFullYear()} Student Academic Materials Platform. All rights reserved.
        </div>
      </footer>

      <div class="toast-container" aria-live="polite" aria-atomic="true"></div>
    `;
  }

  getSidebarNavHTML() {
    const user = window.auth.getUser();
    const isAuthenticated = window.auth.isAuthenticated();
    const isAdmin = window.auth.isAdmin();

    if (!isAuthenticated) return '';

    let nav = `
      <div class="nav-section">
        <div class="nav-section-title">Main</div>
        <a href="/browse" class="nav-link-sidebar" data-link>
          <i class="bi bi-grid"></i> Browse Courses
        </a>
        <a href="/search" class="nav-link-sidebar" data-link>
          <i class="bi bi-search"></i> Search Materials
        </a>
        <a href="/my-uploads" class="nav-link-sidebar" data-link>
          <i class="bi bi-upload"></i> My Uploads
        </a>
        <a href="/bookmarks" class="nav-link-sidebar" data-link>
          <i class="bi bi-bookmark"></i> Bookmarks
        </a>
        <a href="/downloads" class="nav-link-sidebar" data-link>
          <i class="bi bi-download"></i> Download History
        </a>
      </div>
    `;

    if (isAdmin) {
      nav += `
        <div class="nav-section">
          <div class="nav-section-title">Administration</div>
          <a href="/admin" class="nav-link-sidebar" data-link>
            <i class="bi bi-speedometer2"></i> Dashboard
          </a>
          <a href="/admin/users" class="nav-link-sidebar" data-link>
            <i class="bi bi-people"></i> Users
          </a>
          <a href="/admin/materials" class="nav-link-sidebar" data-link>
            <i class="bi bi-file-earmark-text"></i> Materials
          </a>
          <a href="/admin/reports" class="nav-link-sidebar" data-link>
            <i class="bi bi-flag"></i> Reports
          </a>
          <a href="/admin/academic" class="nav-link-sidebar" data-link>
            <i class="bi bi-building"></i> Academic Structure
          </a>
        </div>
      `;
    }

    nav += `
      <div class="nav-section">
        <div class="nav-section-title">Account</div>
        <a href="/profile" class="nav-link-sidebar" data-link>
          <i class="bi bi-person"></i> Profile
        </a>
        <a href="/settings" class="nav-link-sidebar" data-link>
          <i class="bi bi-gear"></i> Settings
        </a>
      </div>
    `;

    return nav;
  }

  getLoadingHTML() {
    return `
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    `;
  }

  getNotFoundHTML() {
    return `
      <div class="empty-state">
        <i class="bi bi-search"></i>
        <h4>Page Not Found</h4>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" class="btn btn-primary mt-3" data-link>Go Home</a>
      </div>
    `;
  }

  getErrorHTML(message) {
    return `
      <div class="empty-state">
        <i class="bi bi-exclamation-triangle"></i>
        <h4>Error</h4>
        <p>${this.escapeHtml(message)}</p>
        <a href="/" class="btn btn-primary mt-3" data-link>Go Home</a>
      </div>
    `;
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}