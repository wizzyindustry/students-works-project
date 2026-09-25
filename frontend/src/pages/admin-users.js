export class AdminUsersPage {
  static template() {
    return `
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 class="h3 mb-1">Manage Users</h1>
            <p class="text-muted mb-0">View and manage user accounts</p>
          </div>
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <form id="filters-form" class="row g-3 align-items-end">
              <div class="col-12 col-md-4">
                <label for="search" class="form-label">Search</label>
                <input type="search" class="form-control" id="search" name="search" placeholder="Name, email, student number...">
              </div>
              <div class="col-6 col-md-3">
                <label for="role-filter" class="form-label">Role</label>
                <select class="form-select" id="role-filter" name="role">
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="col-6 col-md-3">
                <label for="status-filter" class="form-label">Status</label>
                <select class="form-select" id="status-filter" name="isActive">
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
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
            <table class="table table-hover mb-0" id="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>University / Program</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th style="width: 150px;">Actions</th>
                </tr>
              </thead>
              <tbody id="users-body">
                <tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>
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
      role: '',
      isActive: '',
      limit: 20,
      offset: 0
    };

    this.setupEventListeners();
    await this.loadUsers();
  }

  static setupEventListeners() {
    document.getElementById('filters-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.filters.search = document.getElementById('search').value.trim();
      this.filters.role = document.getElementById('role-filter').value || '';
      this.filters.isActive = document.getElementById('status-filter').value || '';
      this.filters.offset = 0;
      this.loadUsers();
    });
  }

  static async loadUsers() {
    const tbody = document.getElementById('users-body');
    const paginationContainer = document.getElementById('pagination-container');

    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>';
    paginationContainer.innerHTML = '';

    try {
      const data = await window.api.getAdminUsers(this.filters);
      this.users = data.users || [];
      this.totalUsers = data.total || 0;
      this.currentPage = Math.floor(this.filters.offset / this.filters.limit) + 1;
      this.totalPages = Math.ceil(this.totalUsers / this.filters.limit);

      this.renderUsers();

      if (this.totalPages > 1) {
        this.renderPagination(paginationContainer);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Failed to load users</td></tr>';
    }
  }

  static renderUsers() {
    const tbody = document.getElementById('users-body');
    if (!tbody) return;

    tbody.innerHTML = this.users.map(user => `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="user-avatar-sm">${this.escapeHtml(user.fullName?.charAt(0).toUpperCase() || 'U')}</div>
            <div>
              <div class="fw-medium">${this.escapeHtml(user.fullName || 'Unknown')}</div>
              <small class="text-muted">${this.escapeHtml(user.email)}</small>
              ${user.studentNumber ? `<div class="text-muted small">${this.escapeHtml(user.studentNumber)}</div>` : ''}
            </div>
          </div>
        </td>
        <td>
          <small>
            ${user.universityName ? `${this.escapeHtml(user.universityName)}<br>` : ''}
            ${user.programName ? `${this.escapeHtml(user.programName)}` : ''}
            ${user.yearOfStudy ? ` • Year ${user.yearOfStudy}` : ''}
          </small>
        </td>
        <td>
          <span class="badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}">${user.role}</span>
        </td>
        <td>
          ${user.isSuspended ? `
            <span class="badge bg-danger">Suspended</span>
            ${user.suspensionReason ? `<div class="text-danger small mt-1">${this.escapeHtml(user.suspensionReason)}</div>` : ''}
          ` : user.isActive ? `
            <span class="badge bg-success">Active</span>
          ` : `
            <span class="badge bg-secondary">Inactive</span>
          `}
        </td>
        <td>
          <small class="text-muted">${user.lastLoginAt ? this.formatDateTime(user.lastLoginAt) : 'Never'}</small>
        </td>
        <td>
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-primary" data-action="view" data-user-id="${user.id}" title="View details">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-outline-secondary" data-action="edit" data-user-id="${user.id}" title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn ${user.isSuspended ? 'btn-outline-success' : 'btn-outline-danger'}" data-action="suspend" data-user-id="${user.id}" title="${user.isSuspended ? 'Unsuspend' : 'Suspend'}">
              <i class="bi bi-${user.isSuspended ? 'person-check' : 'person-x'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="text-center text-muted py-4">No users found</td></tr>';

    // Event handlers
    tbody.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', () => this.viewUser(btn.dataset.userId));
    });

    tbody.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => this.editUser(btn.dataset.userId));
    });

    tbody.querySelectorAll('[data-action="suspend"]').forEach(btn => {
      btn.addEventListener('click', () => this.toggleSuspend(btn.dataset.userId));
    });
  }

  static async viewUser(userId) {
    try {
      const data = await window.api.getAdminUser(userId);
      const user = data.user;

      const modalContent = `
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label text-muted small">Full Name</label>
            <div class="fw-medium">${this.escapeHtml(user.fullName)}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Email</label>
            <div class="fw-medium">${this.escapeHtml(user.email)}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Student Number</label>
            <div class="fw-medium">${this.escapeHtml(user.studentNumber || 'Not provided')}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Role</label>
            <div class="fw-medium"><span class="badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}">${user.role}</span></div>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">University</label>
            <div class="fw-medium">${this.escapeHtml(user.universityName || 'Not set')}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Program</label>
            <div class="fw-medium">${this.escapeHtml(user.programName || 'Not set')}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Year of Study</label>
            <div class="fw-medium">${user.yearOfStudy ? `Year ${user.yearOfStudy}` : 'Not set'}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Status</label>
            <div class="fw-medium">
              ${user.isSuspended ? '<span class="badge bg-danger">Suspended</span>' : user.isActive ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-secondary">Inactive</span>'}
              ${user.suspensionReason ? `<div class="text-danger small mt-1">${this.escapeHtml(user.suspensionReason)}</div>` : ''}
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Last Login</label>
            <div class="fw-medium">${user.lastLoginAt ? this.formatDateTime(user.lastLoginAt) : 'Never'}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Member Since</label>
            <div class="fw-medium">${this.formatDate(user.createdAt)}</div>
          </div>
          <div class="col-12">
            <label class="form-label text-muted small">Statistics</label>
            <div class="d-flex gap-4 text-muted small">
              <span><i class="bi bi-upload me-1"></i> ${user.stats?.uploadsCount || 0} uploads</span>
              <span><i class="bi bi-download me-1"></i> ${user.stats?.downloadsCount || 0} downloads</span>
              <span><i class="bi bi-arrow-down-up me-1"></i> ${user.stats?.totalDownloadsReceived || 0} received</span>
            </div>
          </div>
        </div>
      `;

      window.modal.show(modalContent, { title: 'User Details', size: 'lg' });
    } catch (error) {
      window.toast.error('Failed to load user details');
    }
  }

  static async editUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const modalContent = `
      <form id="edit-user-form">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" name="fullName" value="${this.escapeHtml(user.fullName)}" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">Role</label>
            <select class="form-select" name="role">
              <option value="student" ${user.role === 'student' ? 'selected' : ''}>Student</option>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Student Number</label>
            <input type="text" class="form-control" name="studentNumber" value="${this.escapeHtml(user.studentNumber || '')}">
          </div>
          <div class="col-md-6">
            <label class="form-label">Year of Study</label>
            <select class="form-select" name="yearOfStudy">
              <option value="">Not set</option>
              <option value="1" ${user.yearOfStudy === 1 ? 'selected' : ''}>Year 1</option>
              <option value="2" ${user.yearOfStudy === 2 ? 'selected' : ''}>Year 2</option>
              <option value="3" ${user.yearOfStudy === 3 ? 'selected' : ''}>Year 3</option>
              <option value="4" ${user.yearOfStudy === 4 ? 'selected' : ''}>Year 4</option>
              <option value="5" ${user.yearOfStudy === 5 ? 'selected' : ''}>Year 5</option>
            </select>
          </div>
          <div class="col-12">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" name="isActive" id="isActive" ${user.isActive ? 'checked' : ''}>
              <label class="form-check-label" for="isActive">Active</label>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    `;

    window.modal.show(modalContent, { title: 'Edit User', size: 'md' });

    document.getElementById('edit-user-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        fullName: formData.get('fullName').trim(),
        role: formData.get('role'),
        studentNumber: formData.get('studentNumber')?.trim() || undefined,
        yearOfStudy: formData.get('yearOfStudy') ? parseInt(formData.get('yearOfStudy')) : undefined,
        isActive: formData.get('isActive') === 'on'
      };

      try {
        await window.api.updateAdminUser(userId, data);
        window.toast.success('User updated');
        window.modal.close();
        this.loadUsers();
      } catch (error) {
        window.toast.error('Failed to update user: ' + error.message);
      }
    });
  }

  static async toggleSuspend(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const isSuspended = !user.isSuspended;
    const action = isSuspended ? 'suspend' : 'unsuspend';

    const reason = isSuspended ? await window.modal.confirm(
      'Please provide a reason for suspending this user:',
      `Suspend User`,
      { 
        confirmText: 'Suspend', 
        confirmClass: 'btn-danger',
        customContent: `
          <div class="mb-3">
            <label class="form-label">Reason</label>
            <textarea class="form-control" id="suspend-reason" rows="3" placeholder="Enter reason for suspension..."></textarea>
          </div>
        `
      }) : true;

    if (!reason) return;

    const suspendReason = isSuspended ? document.getElementById('suspend-reason')?.value : undefined;

    try {
      await window.api.suspendUser(userId, isSuspended, suspendReason);
      window.toast.success(`User ${action}ed`);
      this.loadUsers();
    } catch (error) {
      window.toast.error(`Failed to ${action} user: ` + error.message);
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
          this.loadUsers();
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