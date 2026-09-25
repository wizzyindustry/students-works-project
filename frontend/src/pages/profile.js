export class ProfilePage {
  static template() {
    return `
      <div class="container" style="max-width: 700px;">
        <nav aria-label="Breadcrumb" class="breadcrumb-nav mb-4">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a href="/" data-link>Home</a></li>
            <li class="breadcrumb-item active" aria-current="page">Profile</li>
          </ol>
        </nav>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body text-center py-5">
            <div class="user-avatar-large mx-auto mb-3" id="profile-avatar">
              ${window.auth.getUser()?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 class="h4 mb-1" id="profile-name">${window.auth.getUser()?.fullName || 'User'}</h2>
            <p class="text-muted mb-3" id="profile-email">${window.auth.getUser()?.email || ''}</p>
            
            <div class="d-flex justify-content-center gap-3 text-muted small">
              <span><i class="bi bi-person-badge me-1"></i> <span id="profile-student-number">-</span></span>
              <span><i class="bi bi-calendar me-1"></i> Year <span id="profile-year">-</span></span>
            </div>
          </div>
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header">
            <h5 class="mb-0">Academic Information</h5>
          </div>
          <div class="card-body">
            <div class="row g-3" id="academic-info">
              <!-- Loaded dynamically -->
            </div>
          </div>
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Statistics</h5>
          </div>
          <div class="card-body">
            <div class="row g-3 text-center" id="stats-container">
              <!-- Loaded dynamically -->
            </div>
          </div>
        </div>

        <div class="d-grid gap-2 d-md-flex justify-content-md-end">
          <a href="/settings" class="btn btn-outline-secondary" data-link>Account Settings</a>
        </div>
      </div>
    `;
  }

  static async init() {
    await this.loadProfile();
  }

  static async loadProfile() {
    try {
      const data = await window.api.getProfile();
      const user = data.user;
      const stats = data.stats;

      // Update header
      document.getElementById('profile-name').textContent = user.fullName || 'User';
      document.getElementById('profile-email').textContent = user.email || '';
      document.getElementById('profile-student-number').textContent = user.studentNumber || 'Not provided';
      document.getElementById('profile-year').textContent = user.yearOfStudy || 'Not set';
      document.getElementById('profile-avatar').textContent = user.fullName?.charAt(0).toUpperCase() || 'U';

      // Academic info
      const academicContainer = document.getElementById('academic-info');
      academicContainer.innerHTML = `
        <div class="col-md-6">
          <label class="form-label text-muted small">University</label>
          <div class="fw-medium">${this.escapeHtml(user.universityName || 'Not set')}</div>
        </div>
        <div class="col-md-6">
          <label class="form-label text-muted small">Program</label>
          <div class="fw-medium">${this.escapeHtml(user.programName || 'Not set')}</div>
        </div>
        <div class="col-md-6">
          <label class="form-label text-muted small">College</label>
          <div class="fw-medium">${this.escapeHtml(user.collegeName || 'Not set')}</div>
        </div>
        <div class="col-md-6">
          <label class="form-label text-muted small">Year of Study</label>
          <div class="fw-medium">${user.yearOfStudy ? `Year ${user.yearOfStudy}` : 'Not set'}</div>
        </div>
      `;

      // Stats
      const statsContainer = document.getElementById('stats-container');
      statsContainer.innerHTML = `
        <div class="col-6 col-md-3">
          <div class="p-3 bg-light rounded">
            <div class="stat-value">${this.formatNumber(stats.uploadsCount || 0)}</div>
            <div class="stat-label">Uploads</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="p-3 bg-light rounded">
            <div class="stat-value">${this.formatNumber(stats.downloadsCount || 0)}</div>
            <div class="stat-label">Downloads</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="p-3 bg-light rounded">
            <div class="stat-value">${this.formatNumber(stats.totalDownloadsReceived || 0)}</div>
            <div class="stat-label">Downloads Received</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="p-3 bg-light rounded">
            <div class="stat-value">${window.auth.getUser()?.role === 'admin' ? 'Admin' : 'Student'}</div>
            <div class="stat-label">Role</div>
          </div>
        </div>
      `;

    } catch (error) {
      console.error('Failed to load profile:', error);
      window.toast.error('Failed to load profile');
    }
  }

  static formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  static escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}