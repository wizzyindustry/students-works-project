export class AdminDashboardPage {
  static template() {
    return `
      <div class="container-fluid">
        <h1 class="h3 mb-4">Admin Dashboard</h1>

        <div class="row g-4 mb-4" id="stats-cards">
          <!-- Stats loaded here -->
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Recent Materials</h5>
                <a href="/admin/materials" class="btn btn-sm btn-outline-primary" data-link>View All</a>
              </div>
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Course</th>
                      <th>Uploader</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody id="recent-materials">
                    <tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Pending Reports</h5>
                <a href="/admin/reports" class="btn btn-sm btn-outline-primary" data-link>View All</a>
              </div>
              <div class="list-group list-group-flush" id="pending-reports">
                <div class="list-group-item text-center py-4"><div class="spinner-border text-primary" role="status"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static async init() {
    await this.loadStats();
    await this.loadRecentMaterials();
    await this.loadPendingReports();
  }

  static async loadStats() {
    try {
      const data = await window.api.getAdminStats();
      const stats = data.stats;
      const container = document.getElementById('stats-cards');

      container.innerHTML = `
        <div class="col-md-3">
          <div class="card border-0 shadow-sm stat-card">
            <div class="card-body">
              <div class="stat-value">${this.formatNumber(stats.users.total)}</div>
              <div class="stat-label">Total Users</div>
              <small class="text-muted">${stats.users.students} students • ${stats.users.admins} admins</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm stat-card success">
            <div class="card-body">
              <div class="stat-value">${this.formatNumber(stats.materials.approved)}</div>
              <div class="stat-label">Approved Materials</div>
              <small class="text-muted">${this.formatNumber(stats.materials.totalDownloads)} total downloads</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm stat-card warning">
            <div class="card-body">
              <div class="stat-value">${this.formatNumber(stats.materials.pending)}</div>
              <div class="stat-label">Pending Review</div>
              <small class="text-muted">${stats.materials.rejected} rejected</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm stat-card danger">
            <div class="card-body">
              <div class="stat-value">${this.formatNumber(stats.reports.pending)}</div>
              <div class="stat-label">Pending Reports</div>
              <small class="text-muted">${stats.reports.total} total reports</small>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  static async loadRecentMaterials() {
    try {
      const data = await window.api.getAdminMaterials({ limit: 10, status: 'pending' });
      const tbody = document.getElementById('recent-materials');

      tbody.innerHTML = (data.materials || []).map(m => `
        <tr>
          <td>
            <div class="fw-medium">${this.escapeHtml(m.title)}</div>
            <small class="text-muted">${this.escapeHtml(m.materialType?.name || '')}</small>
          </td>
          <td>${this.escapeHtml(m.course?.name || 'Unknown')} (${this.escapeHtml(m.course?.code || '')})</td>
          <td>${this.escapeHtml(m.uploader?.name || 'Unknown')}</td>
          <td>
            <span class="badge ${m.status === 'pending' ? 'bg-warning text-dark' : m.status === 'approved' ? 'bg-success' : 'bg-danger'}">
              ${m.status.charAt(0).toUpperCase() + m.status.slice(1)}
            </span>
          </td>
          <td>${this.formatDate(m.createdAt)}</td>
        </tr>
      `).join('') || '<tr><td colspan="5" class="text-center text-muted py-4">No materials found</td></tr>';
    } catch (error) {
      console.error('Failed to load recent materials:', error);
      document.getElementById('recent-materials').innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Failed to load</td></tr>';
    }
  }

  static async loadPendingReports() {
    try {
      const data = await window.api.getAdminReports({ status: 'pending', limit: 5 });
      const container = document.getElementById('pending-reports');

      container.innerHTML = (data.reports || []).map(r => `
        <a href="/admin/reports" class="list-group-item list-group-item-action" data-link>
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="fw-medium small">${this.escapeHtml(r.materialTitle)}</div>
              <small class="text-muted">Reported by ${this.escapeHtml(r.reporterName)}</small>
            </div>
            <span class="badge bg-${this.getReasonColor(r.reason)}">${this.formatReason(r.reason)}</span>
          </div>
        </a>
      `).join('') || '<div class="list-group-item text-center text-muted py-4">No pending reports</div>';
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  }

  static getReasonColor(reason) {
    const colors = {
      incorrect: 'warning',
      spam: 'danger',
      duplicate: 'info',
      copyright: 'danger',
      offensive: 'danger',
      malware: 'danger',
      wrong_course: 'warning',
      other: 'secondary'
    };
    return colors[reason] || 'secondary';
  }

  static formatReason(reason) {
    return reason.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  static formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  static escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}