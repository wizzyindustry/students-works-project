export class AdminMaterialsPage {
  static template() {
    return `
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 class="h3 mb-1">Manage Materials</h1>
            <p class="text-muted mb-0">Review and moderate uploaded materials</p>
          </div>
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <form id="filters-form" class="row g-3 align-items-end">
              <div class="col-12 col-md-4">
                <label for="search" class="form-label">Search</label>
                <input type="search" class="form-control" id="search" name="search" placeholder="Title, uploader, course...">
              </div>
              <div class="col-6 col-md-3">
                <label for="status-filter" class="form-label">Status</label>
                <select class="form-select" id="status-filter" name="status">
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div class="col-6 col-md-3">
                <label for="course-filter" class="form-label">Course</label>
                <select class="form-select" id="course-filter" name="courseId">
                  <option value="">All Courses</option>
                </select>
              </div>
              <div class="col-12 col-md-2">
                <button type="submit" class="btn btn-primary w-100"><i class="bi bi-search me-1"></i> Filter</button>
              </div>
            </form>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0" id="materials-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Course</th>
                  <th>Uploader</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style="width: 150px;">Actions</th>
                </tr>
              </thead>
              <tbody id="materials-body">
                <tr><td colspan="8" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>
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
      search: '',
      status: '',
      courseId: '',
      limit: 20,
      offset: 0
    };

    await this.loadCourses();
    this.setupEventListeners();
    await this.loadMaterials();
  }

  static async loadCourses() {
    try {
      const hierarchyData = await window.api.getHierarchy();
      if (hierarchyData.hierarchy) {
        this.courses = [];
        hierarchyData.hierarchy.forEach(uni => {
          uni.colleges?.forEach(college => {
            college.programs?.forEach(program => {
              program.courses?.forEach(course => {
                this.courses.push({
                  id: course.id,
                  name: course.name,
                  code: course.code,
                  programName: program.name
                });
              });
            });
          });
        });

        const select = document.getElementById('course-filter');
        select.innerHTML = '<option value="">All Courses</option>' +
          this.courses.map(c => `<option value="${c.id}">${this.escapeHtml(c.name)} (${this.escapeHtml(c.code)})</option>`).join('');
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  }

  static setupEventListeners() {
    document.getElementById('filters-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.filters.search = document.getElementById('search').value.trim();
      this.filters.status = document.getElementById('status-filter').value || '';
      this.filters.courseId = document.getElementById('course-filter').value || '';
      this.filters.offset = 0;
      this.loadMaterials();
    });
  }

  static async loadMaterials() {
    const tbody = document.getElementById('materials-body');
    const paginationContainer = document.getElementById('pagination-container');

    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>';
    paginationContainer.innerHTML = '';

    try {
      const data = await window.api.getAdminMaterials(this.filters);
      this.materials = data.materials || [];
      this.totalMaterials = data.total || 0;
      this.currentPage = Math.floor(this.filters.offset / this.filters.limit) + 1;
      this.totalPages = Math.ceil(this.totalMaterials / this.filters.limit);

      this.renderMaterials();

      if (this.totalPages > 1) {
        this.renderPagination(paginationContainer);
      }
    } catch (error) {
      console.error('Failed to load materials:', error);
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-4">Failed to load materials</td></tr>';
    }
  }

  static renderMaterials() {
    const tbody = document.getElementById('materials-body');
    if (!tbody) return;

    tbody.innerHTML = this.materials.map(m => `
      <tr>
        <td>
          <div class="fw-medium" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.escapeHtml(m.title)}</div>
          <small class="text-muted">${this.escapeHtml(m.fileName)}</small>
        </td>
        <td>
          ${m.course ? `${this.escapeHtml(m.course.name)} (${this.escapeHtml(m.course.code)})` : 'Unknown'}
        </td>
        <td>
          ${this.escapeHtml(m.uploader?.name || 'Unknown')}
          ${m.uploader?.studentNumber ? `<br><small class="text-muted">${this.escapeHtml(m.uploader.studentNumber)}</small>` : ''}
        </td>
        <td>
          ${m.materialType ? `<span class="badge bg-primary bg-opacity-10 text-primary"><i class="bi bi-${m.materialType.icon || 'file'} me-1"></i>${this.escapeHtml(m.materialType.name)}</span>` : 'N/A'}
        </td>
        <td>${this.formatFileSize(m.fileSize)}</td>
        <td>
          <span class="badge ${m.status === 'pending' ? 'bg-warning text-dark' : m.status === 'approved' ? 'bg-success' : 'bg-danger'}">
            ${m.status.charAt(0).toUpperCase() + m.status.slice(1)}
          </span>
        </td>
        <td>${this.formatDate(m.createdAt)}</td>
        <td>
          <div class="btn-group btn-group-sm" role="group">
            <a href="/material/${m.id}" class="btn btn-outline-primary" data-link title="View">
              <i class="bi bi-eye"></i>
            </a>
            ${m.status === 'pending' ? `
              <button class="btn btn-outline-success" data-action="approve" data-material-id="${m.id}" title="Approve">
                <i class="bi bi-check"></i>
              </button>
              <button class="btn btn-outline-danger" data-action="reject" data-material-id="${m.id}" title="Reject">
                <i class="bi bi-x"></i>
              </button>
            ` : ''}
            <button class="btn btn-outline-danger" data-action="delete" data-material-id="${m.id}" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="8" class="text-center text-muted py-4">No materials found</td></tr>';

    // Event handlers
    tbody.querySelectorAll('[data-action="approve"]').forEach(btn => {
      btn.addEventListener('click', () => this.updateStatus(btn.dataset.materialId, 'approved'));
    });

    tbody.querySelectorAll('[data-action="reject"]').forEach(btn => {
      btn.addEventListener('click', () => this.showRejectModal(btn.dataset.materialId));
    });

    tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => this.confirmDelete(btn.dataset.materialId));
    });
  }

  static async updateStatus(materialId, status, rejectionReason = null) {
    try {
      await window.api.approveMaterial(materialId, status, rejectionReason);
      window.toast.success(`Material ${status}`);
      this.loadMaterials();
    } catch (error) {
      window.toast.error(`Failed to ${status} material: ` + error.message);
    }
  }

  static showRejectModal(materialId) {
    const modalContent = `
      <form id="reject-form">
        <div class="mb-3">
          <label class="form-label">Rejection Reason</label>
          <textarea class="form-control" name="rejectionReason" rows="3" required placeholder="Explain why this material is being rejected..."></textarea>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-danger">Reject Material</button>
        </div>
      </form>
    `;

    window.modal.show(modalContent, { title: 'Reject Material', size: 'md' });

    document.getElementById('reject-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const reason = formData.get('rejectionReason').trim();

      if (!reason) {
        window.toast.error('Please provide a rejection reason');
        return;
      }

      window.modal.close();
      await this.updateStatus(materialId, 'rejected', reason);
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
        await window.api.deleteAdminMaterial(materialId);
        window.toast.success('Material deleted');
        this.loadMaterials();
      } catch (error) {
        window.toast.error('Failed to delete: ' + error.message);
      }
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
          this.loadMaterials();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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