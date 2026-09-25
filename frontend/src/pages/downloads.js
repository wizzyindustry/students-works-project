export class DownloadsPage {
  static template() {
    return `
      <div class="container-fluid">
        <h1 class="h3 mb-4">Download History</h1>

        <div class="card border-0 shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0" id="downloads-table">
              <thead>
                <tr>
                  <th scope="col">Material</th>
                  <th scope="col">Course</th>
                  <th scope="col">Downloaded</th>
                  <th scope="col" style="width: 120px;">Actions</th>
                </tr>
              </thead>
              <tbody id="downloads-body">
                <!-- Downloads loaded here -->
              </tbody>
            </table>
          </div>
        </div>

        <nav aria-label="Pagination" class="mt-4" id="pagination-container"></nav>

        <div class="empty-state d-none" id="empty-state">
          <i class="bi bi-download"></i>
          <h4>No downloads yet</h4>
          <p>Your download history will appear here</p>
          <a href="/search" class="btn btn-primary mt-3" data-link>Browse Materials</a>
        </div>
      </div>
    `;
  }

  static async init() {
    this.filters = {
      limit: 20,
      offset: 0
    };
    await this.loadDownloads();
  }

  static async loadDownloads() {
    const tbody = document.getElementById('downloads-body');
    const emptyState = document.getElementById('empty-state');
    const paginationContainer = document.getElementById('pagination-container');

    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div></td></tr>';
    emptyState.classList.add('d-none');
    paginationContainer.innerHTML = '';

    try {
      const data = await window.api.getDownloadHistory(this.filters);
      this.downloads = data.downloads || [];
      this.totalDownloads = data.total || 0;
      this.currentPage = Math.floor(this.filters.offset / this.filters.limit) + 1;
      this.totalPages = Math.ceil(this.totalDownloads / this.filters.limit);

      this.renderDownloads();
      
      if (this.totalPages > 1) {
        this.renderPagination(paginationContainer);
      }

      emptyState.classList.toggle('d-none', this.downloads.length > 0);
    } catch (error) {
      console.error('Failed to load downloads:', error);
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Failed to load downloads</td></tr>';
    }
  }

  static renderDownloads() {
    const tbody = document.getElementById('downloads-body');
    if (!tbody) return;

    tbody.innerHTML = this.downloads.map(d => `
      <tr>
        <td>
          <div class="fw-medium">${this.escapeHtml(d.material?.title || 'Unknown Material')}</div>
          <small class="text-muted">${this.escapeHtml(d.material?.fileName || '')}</small>
        </td>
        <td>
          ${d.material?.course ? `
            <div>${this.escapeHtml(d.material.course.name)}</div>
            <small class="text-muted">${this.escapeHtml(d.material.course.code)}</small>
          ` : '<span class="text-muted">Unknown</span>'}
        </td>
        <td>${this.formatDateTime(d.downloadedAt)}</td>
        <td>
          <div class="d-flex gap-1">
            ${d.material?.id ? `
              <a href="/material/${d.material.id}" class="btn btn-sm btn-outline-primary" data-link aria-label="View material">
                <i class="bi bi-eye"></i>
              </a>
              <button class="btn btn-sm btn-outline-secondary" data-action="download" data-material-id="${d.material.id}" aria-label="Download again">
                <i class="bi bi-download"></i>
              </button>
            ` : '<span class="text-muted small">Unavailable</span>'}
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-action="download"]').forEach(btn => {
      btn.addEventListener('click', () => this.downloadMaterial(btn.dataset.materialId));
    });
  }

  static async downloadMaterial(materialId) {
    try {
      const blob = await window.api.downloadMaterial(materialId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      window.toast.success('Download started');
    } catch (error) {
      window.toast.error('Download failed: ' + error.message);
    }
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
          this.loadDownloads();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  static formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

window.downloadsPage = new DownloadsPage();