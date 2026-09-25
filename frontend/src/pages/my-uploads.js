export class MyUploadsPage {
  static template() {
    return `
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 class="h3 mb-1">My Uploads</h1>
            <p class="text-muted mb-0">Manage your uploaded materials</p>
          </div>
          <a href="/upload" class="btn btn-primary" data-link>
            <i class="bi bi-upload me-2"></i> Upload New
          </a>
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <div class="row g-3 align-items-end">
              <div class="col-12 col-md-4">
                <label for="status-filter" class="form-label">Status</label>
                <select class="form-select" id="status-filter">
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div class="col-12 col-md-4">
                <label for="sort-filter" class="form-label">Sort By</label>
                <select class="form-select" id="sort-filter">
                  <option value="created_at">Newest First</option>
                  <option value="title">Title</option>
                  <option value="download_count">Most Downloaded</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-3" id="uploads-container" role="list" aria-label="My uploads">
          <!-- Uploads loaded here -->
        </div>

        <nav aria-label="Pagination" class="mt-4" id="pagination-container"></nav>

        <div class="empty-state d-none" id="empty-state">
          <i class="bi bi-upload"></i>
          <h4>No uploads yet</h4>
          <p>Start sharing your academic materials with fellow students</p>
          <a href="/upload" class="btn btn-primary mt-3" data-link>Upload Your First Material</a>
        </div>
      </div>
    `;
  }

  static async init() {
    this.filters = {
      status: '',
      sortBy: 'created_at',
      limit: 20,
      offset: 0
    };

    this.setupEventListeners();
    await this.loadUploads();
  }

  static setupEventListeners() {
    document.getElementById('status-filter').addEventListener('change', (e) => {
      this.filters.status = e.target.value || '';
      this.filters.offset = 0;
      this.loadUploads();
    });

    document.getElementById('sort-filter').addEventListener('change', (e) => {
      this.filters.sortBy = e.target.value;
      this.filters.offset = 0;
      this.loadUploads();
    });
  }

  static async loadUploads() {
    const container = document.getElementById('uploads-container');
    const emptyState = document.getElementById('empty-state');
    const paginationContainer = document.getElementById('pagination-container');

    container.innerHTML = this.getLoadingHTML();
    emptyState.classList.add('d-none');
    paginationContainer.innerHTML = '';

    try {
      const data = await window.api.getUserUploads(this.filters);
      this.uploads = data.materials || [];
      this.totalUploads = data.total || 0;
      this.currentPage = Math.floor(this.filters.offset / this.filters.limit) + 1;
      this.totalPages = Math.ceil(this.totalUploads / this.filters.limit);

      this.renderUploads();

      if (this.totalPages > 1) {
        this.renderPagination(paginationContainer);
      }

      emptyState.classList.toggle('d-none', this.uploads.length > 0);
    } catch (error) {
      console.error('Failed to load uploads:', error);
      container.innerHTML = this.getErrorHTML();
    }
  }

  static renderUploads() {
    const container = document.getElementById('uploads-container');
    if (!container) return;

    container.innerHTML = this.uploads.map(upload => this.getCardHTML(upload)).join('');

    // Add event handlers
    container.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.materialId;
        window.router.navigate(`/upload?edit=${id}`);
      });
    });

    container.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.materialId;
        this.confirmDelete(id);
      });
    });

    container.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.materialId;
        window.router.navigate(`/material/${id}`);
      });
    });
  }

  static getCardHTML(upload) {
    const statusBadges = {
      pending: '<span class="badge bg-warning text-dark">Pending Review</span>',
      approved: '<span class="badge bg-success">Approved</span>',
      rejected: '<span class="badge bg-danger">Rejected</span>'
    };

    const statusBadge = statusBadges[upload.status] || `<span class="badge bg-secondary">${upload.status}</span>`;

    return `
      <div class="col-12 col-md-6 col-lg-4" role="listitem">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title mb-1">${this.escapeHtml(upload.title)}</h6>
              ${statusBadge}
            </div>
            <div class="text-muted small mb-2">
              ${this.escapeHtml(upload.course?.name || 'Unknown Course')} (${this.escapeHtml(upload.course?.code || '')})
            </div>
            ${upload.materialType ? `<span class="badge bg-primary bg-opacity-10 text-primary mb-2"><i class="bi bi-${upload.materialType.icon || 'file'} me-1"></i>${this.escapeHtml(upload.materialType.name)}</span>` : ''}
            <div class="mt-auto pt-3 border-top">
              <div class="d-flex justify-content-between align-items-center small text-muted mb-2">
                <span><i class="bi bi-download me-1"></i> ${this.formatNumber(upload.downloadCount)}</span>
                <span><i class="bi bi-calendar me-1"></i> ${this.formatDate(upload.createdAt)}</span>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary flex-grow-1" data-action="view" data-material-id="${upload.id}">
                  <i class="bi bi-eye me-1"></i> View
                </button>
                ${upload.status === 'pending' || upload.status === 'rejected' ? `
                  <button class="btn btn-sm btn-outline-secondary flex-grow-1" data-action="edit" data-material-id="${upload.id}">
                    <i class="bi bi-pencil me-1"></i> Edit
                  </button>
                ` : ''}
                <button class="btn btn-sm btn-outline-danger" data-action="delete" data-material-id="${upload.id}" aria-label="Delete ${this.escapeHtml(upload.title)}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              ${upload.rejectionReason ? `
                <div class="alert alert-danger mt-2 p-2 small mb-0">
                  <strong>Rejected:</strong> ${this.escapeHtml(upload.rejectionReason)}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
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
          this.loadUploads();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  static async confirmDelete(materialId) {
    const confirmed = await window.modal.confirm(
      'Are you sure you want to delete this material? This action cannot be undone.',
      'Delete Material',
      { confirmText: 'Delete', confirmClass: 'btn-danger' }
    );

    if (confirmed) {
      try {
        await window.api.deleteMaterial(materialId);
        window.toast.success('Material deleted');
        this.loadUploads();
      } catch (error) {
        window.toast.error('Failed to delete: ' + error.message);
      }
    }
  }

  static getLoadingHTML() {
    return Array(4).fill(0).map(() => `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="skeleton" style="height: 1.25rem; width: 80%; margin-bottom: 0.5rem;"></div>
            <div class="skeleton" style="height: 1rem; width: 60%; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="height: 1rem; width: 40%;"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  static getErrorHTML() {
    return `
      <div class="col-12">
        <div class="empty-state">
          <i class="bi bi-exclamation-triangle"></i>
          <h4>Failed to load uploads</h4>
          <button class="btn btn-primary mt-3" onclick="window.myUploadsPage.loadUploads()">Retry</button>
        </div>
      </div>
    `;
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

window.myUploadsPage = new MyUploadsPage();