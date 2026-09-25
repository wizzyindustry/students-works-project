export class AdminReportsPage {
  static template() {
    return `
      <div class="container-fluid">
        <h1 class="h3 mb-4">Manage Reports</h1>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <form id="filters-form" class="row g-3 align-items-end">
              <div class="col-6 col-md-3">
                <label for="status-filter" class="form-label">Status</label>
                <select class="form-select" id="status-filter" name="status">
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
              <div class="col-12 col-md-3">
                <button type="submit" class="btn btn-primary w-100"><i class="bi bi-search me-1"></i> Filter</button>
              </div>
            </form>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0" id="reports-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Reporter</th>
                  <th>Reason</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style="width: 150px;">Actions</th>
                </tr>
              </thead>
              <tbody id="reports-body">
                <tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <nav aria-label="Pagination" class="mt-4" id="pagination-container"></nav>
      </div>
    `;
  }

  static async init() {
    this.filters = {
      status: '',
      limit: 20,
      offset: 0
    };

    this.setupEventListeners();
    await this.loadReports();
  }

  static setupEventListeners() {
    document.getElementById('filters-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.filters.status = document.getElementById('status-filter').value || '';
      this.filters.offset = 0;
      this.loadReports();
    });
  }

  static async loadReports() {
    const tbody = document.getElementById('reports-body');
    const paginationContainer = document.getElementById('pagination-container');

    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>';
    paginationContainer.innerHTML = '';

    try {
      const data = await window.api.getAdminReports(this.filters);
      this.reports = data.reports || [];
      this.totalReports = data.total || 0;
      this.currentPage = Math.floor(this.filters.offset / this.filters.limit) + 1;
      this.totalPages = Math.ceil(this.totalReports / this.filters.limit);

      this.renderReports();

      if (this.totalPages > 1) {
        this.renderPagination(paginationContainer);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Failed to load reports</td></tr>';
    }
  }

  static renderReports() {
    const tbody = document.getElementById('reports-body');
    if (!tbody) return;

    tbody.innerHTML = this.reports.map(r => `
      <tr>
        <td>
          <a href="/material/${r.materialId}" class="fw-medium" data-link>${this.escapeHtml(r.materialTitle)}</a>
        </td>
        <td>
          ${this.escapeHtml(r.reporterName)}
          <br><small class="text-muted">${this.escapeHtml(r.reporterEmail)}</small>
        </td>
        <td>
          <span class="badge ${this.getReasonBadgeClass(r.reason)}">${this.formatReason(r.reason)}</span>
        </td>
        <td>
          <small>${this.escapeHtml(r.description || 'No description provided')}</small>
        </td>
        <td>
          <span class="badge ${this.getStatusBadgeClass(r.status)}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
        </td>
        <td>${this.formatDate(r.createdAt)}</td>
        <td>
          <div class="btn-group btn-group-sm" role="group">
            <a href="/material/${r.materialId}" class="btn btn-outline-primary" data-link title="View Material">
              <i class="bi bi-eye"></i>
            </a>
            ${r.status === 'pending' ? `
              <button class="btn btn-outline-success" data-action="review" data-report-id="${r.id}" title="Mark as Reviewed">
                <i class="bi bi-check"></i>
              </button>
              <button class="btn btn-outline-primary" data-action="resolve" data-report-id="${r.id}" title="Resolve">
                <i class="bi bi-check-circle"></i>
              </button>
              <button class="btn btn-outline-secondary" data-action="dismiss" data-report-id="${r.id}" title="Dismiss">
                <i class="bi bi-x-circle"></i>
              </button>
            ` : r.status === 'reviewed' ? `
              <button class="btn btn-outline-primary" data-action="resolve" data-report-id="${r.id}" title="Resolve">
                <i class="bi bi-check-circle"></i>
              </button>
              <button class="btn btn-outline-secondary" data-action="dismiss" data-report-id="${r.id}" title="Dismiss">
                <i class="bi bi-x-circle"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="7" class="text-center text-muted py-4">No reports found</td></tr>';

    tbody.querySelectorAll('[data-action="review"]').forEach(btn => {
      btn.addEventListener('click', () => this.updateStatus(btn.dataset.reportId, 'reviewed'));
    });

    tbody.querySelectorAll('[data-action="resolve"]').forEach(btn => {
      btn.addEventListener('click', () => this.showResolveModal(btn.dataset.reportId));
    });

    tbody.querySelectorAll('[data-action="dismiss"]').forEach(btn => {
      btn.addEventListener('click', () => this.updateStatus(btn.dataset.reportId, 'dismissed'));
    });
  }

  static getReasonBadgeClass(reason) {
    const classes = {
      incorrect: 'bg-warning text-dark',
      spam: 'bg-danger',
      duplicate: 'bg-info',
      copyright: 'bg-danger',
      offensive: 'bg-danger',
      malware: 'bg-danger',
      wrong_course: 'bg-warning text-dark',
      other: 'bg-secondary'
    };
    return classes[reason] || 'bg-secondary';
  }

  static getStatusBadgeClass(status) {
    const classes = {
      pending: 'bg-warning text-dark',
      reviewed: 'bg-info',
      resolved: 'bg-success',
      dismissed: 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  static formatReason(reason) {
    return reason.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  static async updateStatus(reportId, status, resolution = null) {
    try {
      await window.api.updateReportStatus(reportId, status, resolution);
      window.toast.success(`Report marked as ${status}`);
      this.loadReports();
    } catch (error) {
      window.toast.error(`Failed to update report: ` + error.message);
    }
  }

  static showResolveModal(reportId) {
    const modalContent = `
      <form id="resolve-form">
        <div class="mb-3">
          <label class="form-label">Resolution Notes</label>
          <textarea class="form-control" name="resolution" rows="3" placeholder="Describe how this report was resolved..."></textarea>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Mark as Resolved</button>
        </div>
      </form>
    `;

    window.modal.show(modalContent, { title: 'Resolve Report', size: 'md' });

    document.getElementById('resolve-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const resolution = formData.get('resolution').trim();

      window.modal.close();
      await this.updateStatus(reportId, 'resolved', resolution || 'Resolved by admin');
    });
  }

  static renderPagination(container) {
    let html = '<ul class="pagination justify-content-center">';
    
    html += `<li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${this.currentPage - 1}" aria-label="Previous"><i class="bi bi-chevron-left"></i></a>
    </li>`;

    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    
    for (let i = start; i <= end; i++) {
      html += `<li class="page-item ${i === this.currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
    }

    html += `<li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${this.currentPage + 1}" aria-label="Next"><i class="bi bi-chevron-right"></i></a>
    </li>`;

    html += '</ul>';
    container.innerHTML = html;

    container.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(link.dataset.page);
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
          this.filters.offset = (page - 1) * this.filters.limit;
          this.loadReports();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
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