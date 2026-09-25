// Import page components
import { HomePage } from '../pages/home.js';
import { LoginPage } from '../pages/login.js';
import { RegisterPage } from '../pages/register.js';
import { BrowsePage } from '../pages/browse.js';
import { SearchPage } from '../pages/search.js';
import { MaterialDetailPage } from '../pages/material-detail.js';
import { UploadPage } from '../pages/upload.js';
import { MyUploadsPage } from '../pages/my-uploads.js';
import { BookmarksPage } from '../pages/bookmarks.js';
import { DownloadsPage } from '../pages/downloads.js';
import { ProfilePage } from '../pages/profile.js';
import { SettingsPage } from '../pages/settings.js';
import { AdminDashboardPage } from '../pages/admin-dashboard.js';
import { AdminUsersPage } from '../pages/admin-users.js';
import { AdminMaterialsPage } from '../pages/admin-materials.js';
import { AdminReportsPage } from '../pages/admin-reports.js';
import { AdminAcademicPage } from '../pages/admin-academic.js';

const routes = [
  { path: '/', component: HomePage, title: 'Home' },
  { path: '/login', component: LoginPage, title: 'Login' },
  { path: '/register', component: RegisterPage, title: 'Register' },
  { path: '/browse', component: BrowsePage, title: 'Browse Courses', requiresAuth: true },
  { path: '/search', component: SearchPage, title: 'Search Materials', requiresAuth: true },
  { path: '/material/:id', component: MaterialDetailPage, title: 'Material Details', requiresAuth: true },
  { path: '/upload', component: UploadPage, title: 'Upload Material', requiresAuth: true },
  { path: '/my-uploads', component: MyUploadsPage, title: 'My Uploads', requiresAuth: true },
  { path: '/bookmarks', component: BookmarksPage, title: 'Bookmarks', requiresAuth: true },
  { path: '/downloads', component: DownloadsPage, title: 'Download History', requiresAuth: true },
  { path: '/profile', component: ProfilePage, title: 'Profile', requiresAuth: true },
  { path: '/settings', component: SettingsPage, title: 'Settings', requiresAuth: true },
  { path: '/admin', component: AdminDashboardPage, title: 'Admin Dashboard', requiresAuth: true, requiresAdmin: true },
  { path: '/admin/users', component: AdminUsersPage, title: 'Manage Users', requiresAuth: true, requiresAdmin: true },
  { path: '/admin/materials', component: AdminMaterialsPage, title: 'Manage Materials', requiresAuth: true, requiresAdmin: true },
  { path: '/admin/reports', component: AdminReportsPage, title: 'Manage Reports', requiresAuth: true, requiresAdmin: true },
  { path: '/admin/academic', component: AdminAcademicPage, title: 'Academic Structure', requiresAuth: true, requiresAdmin: true },
];

export class Router {
  constructor() {
    this.routes = routes;
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    window.app.render();
  }

  replace(path) {
    window.history.replaceState({}, '', path);
    window.app.render();
  }

  resolve(pathname) {
    // Exact match first
    let route = this.routes.find(r => r.path === pathname);
    
    if (!route) {
      // Pattern matching for dynamic routes
      for (const r of this.routes) {
        const pattern = this.pathToRegex(r.path);
        const match = pathname.match(pattern);
        if (match) {
          route = { ...r, params: match.slice(1) };
          break;
        }
      }
    }

    return route || null;
  }

  pathToRegex(path) {
    const regexPath = path.replace(/:([^/]+)/g, '([^/]+)');
    return new RegExp(`^${regexPath}$`);
  }

  getCurrentPath() {
    return window.location.pathname;
  }

  getQueryParams() {
    return new URLSearchParams(window.location.search);
  }
}