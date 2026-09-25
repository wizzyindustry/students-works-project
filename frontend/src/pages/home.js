export class HomePage {
  static template() {
    return `
      <div class="container-fluid">
        <section class="hero-section py-5 mb-4">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h1 class="display-4 fw-bold mb-3">Academic Materials Platform</h1>
              <p class="lead text-muted mb-4">
                Share, discover, and download lecture notes, past exams, assignments, 
                and study resources for your university courses.
              </p>
              <div class="d-flex gap-3 flex-wrap">
                <a href="/browse" class="btn btn-primary btn-lg" data-link>
                  <i class="bi bi-grid me-2"></i> Browse Courses
                </a>
                <a href="/register" class="btn btn-outline-primary btn-lg" data-link>
                  <i class="bi bi-person-plus me-2"></i> Get Started
                </a>
              </div>
            </div>
            <div class="col-lg-6 d-none d-lg-block">
              <div class="bg-light rounded-3 p-5 text-center">
                <i class="bi bi-book-half" style="font-size: 6rem; color: var(--bs-primary); opacity: 0.3;"></i>
              </div>
            </div>
          </div>
        </section>

        <section class="features-section mb-5">
          <div class="row g-4">
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body text-center p-4">
                  <div class="mb-3">
                    <i class="bi bi-upload" style="font-size: 2.5rem; color: var(--bs-primary);"></i>
                  </div>
                  <h5 class="card-title">Upload Materials</h5>
                  <p class="card-text text-muted">
                    Share your lecture notes, past exams, assignments, and tutorials 
                    with students in your course.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body text-center p-4">
                  <div class="mb-3">
                    <i class="bi bi-search" style="font-size: 2.5rem; color: var(--bs-primary);"></i>
                  </div>
                  <h5 class="card-title">Discover Resources</h5>
                  <p class="card-text text-muted">
                    Browse materials organized by university, program, year, semester, 
                    and course. Find exactly what you need.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body text-center p-4">
                  <div class="mb-3">
                    <i class="bi bi-download" style="font-size: 2.5rem; color: var(--bs-primary);"></i>
                  </div>
                  <h5 class="card-title">Download & Rate</h5>
                  <p class="card-text text-muted">
                    Download approved materials instantly. Rate and review resources 
                    to help others find quality content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="stats-section mb-5">
          <div class="row g-4" id="stats-container">
            <!-- Stats loaded dynamically -->
          </div>
        </section>

        <section class="cta-section">
          <div class="card border-0 bg-primary text-white">
            <div class="card-body text-center py-5">
              <h2 class="mb-3">Ready to start sharing?</h2>
              <p class="lead mb-4 opacity-75">Join thousands of students sharing academic resources</p>
              <a href="/register" class="btn btn-light btn-lg" data-link>
                <i class="bi bi-person-plus me-2"></i> Create Free Account
              </a>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  static async init() {
    await this.loadStats();
  }

  static async loadStats() {
    try {
      const data = await window.api.get('/materials/stats');
      const container = document.getElementById('stats-container');
      if (container && data.stats) {
        const { materials, users } = data.stats;
        container.innerHTML = `
          <div class="col-md-3">
            <div class="card border-0 shadow-sm stat-card">
              <div class="card-body text-center">
                <div class="stat-value">${this.formatNumber(materials.approved || 0)}</div>
                <div class="stat-label">Approved Materials</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm stat-card success">
              <div class="card-body text-center">
                <div class="stat-value">${this.formatNumber(materials.totalDownloads || 0)}</div>
                <div class="stat-label">Total Downloads</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm stat-card warning">
              <div class="card-body text-center">
                <div class="stat-value">${this.formatNumber(users.students || 0)}</div>
                <div class="stat-label">Active Students</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm stat-card info">
              <div class="card-body text-center">
                <div class="stat-value">${this.formatNumber(users.active || 0)}</div>
                <div class="stat-label">Total Users</div>
              </div>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  static formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}