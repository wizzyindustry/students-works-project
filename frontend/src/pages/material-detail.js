export class MaterialDetailPage {
  static template() {
    return `
      <div class="container-fluid" style="max-width: 900px;">
        <nav aria-label="Breadcrumb" class="breadcrumb-nav mb-3">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a href="/" data-link>Home</a></li>
            <li class="breadcrumb-item"><a href="/search" data-link>Search</a></li>
            <li class="breadcrumb-item active" aria-current="page" id="breadcrumb-title">Material Details</li>
          </ol>
        </nav>

        <div id="material-content">
          <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static async init() {
    const params = window.router.getQueryParams();
    this.materialId = params.get('id') || window.location.pathname.split('/').pop();
    
    if (!this.materialId) {
      window.router.navigate('/search');
      return;
    }

    await this.loadMaterial();
  }

  static async loadMaterial() {
    const container = document.getElementById('material-content');
    if (!container) return;

    try {
      const data = await window.api.getMaterial(this.materialId);
      this.material = data.material;
      this.renderMaterial(container);
    } catch (error) {
      console.error('Failed to load material:', error);
      container.innerHTML = this.getErrorHTML();
    }
  }

  static renderMaterial(container) {
    const m = this.material;
    const isOwner = window.auth.getUser()?.id === m.uploader?.id;
    const isAdmin = window.auth.isAdmin();

    // Update breadcrumb
    document.getElementById('breadcrumb-title').textContent = m.title;

    // Determine file icon
    const fileIcon = this.getFileIcon(m.mimeType);
    const canDownload = m.status === 'approved';

    container.innerHTML = `
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 pb-0">
              <div class="d-flex flex-wrap align-items-start justify-content-between gap-2">
                <div>
                  ${m.materialType ? `<span class="badge bg-primary bg-opacity-10 text-primary mb-2"><i class="bi bi-${m.materialType.icon || 'file'} me-1"></i>${this.escapeHtml(m.materialType.name)}</span>` : ''}
                  <h2 class="h4 mb-2">${this.escapeHtml(m.title)}</h2>
                </div>
                <div class="dropdown">
                  <button class="btn btn-outline-secondary btn-sm" data-bs-toggle="dropdown" aria-expanded="false" aria-label="More options">
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    ${canDownload ? `<li><button class="dropdown-item" data-action="download"><i class="bi bi-download me-2"></i>Download</button></li>` : ''}
                    <li><button class="dropdown-item" data-action="bookmark"><i class="bi bi-bookmark me-2"></i>Bookmark</button></li>
                    <li><button class="dropdown-item" data-action="rate"><i class="bi bi-star me-2"></i>Rate</button></li>
                    <li><button class="dropdown-item text-danger" data-action="report"><i class="bi bi-flag me-2"></i>Report</button></li>
                    ${(isOwner || isAdmin) ? `
                      <li><hr class="dropdown-divider"></li>
                      <li><a class="dropdown-item" href="/upload?edit=${m.id}" data-link><i class="bi bi-pencil me-2"></i>Edit</a></li>
                      <li><button class="dropdown-item text-danger" data-action="delete"><i class="bi bi-trash me-2"></i>Delete</button></li>
                    ` : ''}
                  </ul>
                </div>
              </div>
            </div>
            <div class="card-body">
              ${m.description ? `<div class="mb-4"><p class="text-muted">${this.escapeHtml(m.description)}</p></div>` : ''}
              
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="bi bi-journal-text"></i>
                    <span>${this.escapeHtml(m.course?.name || 'Unknown Course')} (${this.escapeHtml(m.course?.code || '')})</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="bi bi-book"></i>
                    <span>${this.escapeHtml(m.program?.name || '')} ${m.program?.code ? `(${this.escapeHtml(m.program.code)})` : ''}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="bi bi-building"></i>
                    <span>${this.escapeHtml(m.university?.name || '')}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="bi bi-calendar"></i>
                    <span>${m.academicYear ? `${m.academicYear} • Semester ${m.semester}` : 'N/A'}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="bi bi-file-earmark"></i>
                    <span>${this.escapeHtml(m.fileName)} • ${this.formatFileSize(m.fileSize)}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="bi bi-person"></i>
                    <span>Uploaded by ${this.escapeHtml(m.uploader?.name || 'Unknown')} ${m.uploader?.studentNumber ? `(${this.escapeHtml(m.uploader.studentNumber)})` : ''}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="bi bi-clock"></i>
                    <span>Uploaded ${this.formatDate(m.createdAt)}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="bi bi-download"></i>
                    <span>${this.formatNumber(m.downloadCount)} downloads</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="bi bi-eye"></i>
                    <span>${this.formatNumber(m.viewCount)} views</span>
                  </div>
                </div>
              </div>

              <!-- Rating -->
              <div class="border-top pt-4">
                <h6 class="mb-3">Ratings & Reviews</h6>
                <div class="d-flex align-items-center gap-4 mb-3">
                  <div class="text-center">
                    <div class="display-4 fw-bold text-warning">${m.averageRating?.toFixed(1) || '0.0'}</div>
                    <div class="rating-stars">${this.getStarsHTML(m.averageRating || 0)}</div>
                    <small class="text-muted">${m.ratingCount} review${m.ratingCount !== 1 ? 's' : ''}</small>
                  </div>
                  <div class="flex-grow-1" id="rating-breakdown">
                    ${this.getRatingBreakdownHTML(m.ratingStats)}
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-primary" data-action="rate">
                    <i class="bi bi-star me-2"></i> Rate this material
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card border-0 shadow-sm sticky-top" style="top: 90px;">
            <div class="card-body">
              <div class="d-grid gap-2">
                ${canDownload ? `
                  <button class="btn btn-primary btn-lg" data-action="download" id="download-btn">
                    <i class="bi bi-download me-2"></i> Download Material
                  </button>
                ` : `
                  <button class="btn btn-secondary btn-lg" disabled>
                    <i class="bi bi-lock me-2"></i> Pending Approval
                  </button>
                  <small class="text-muted text-center d-block">This material is pending admin approval.</small>
                `}
                <button class="btn btn-outline-secondary" data-action="bookmark">
                  <i class="bi bi-bookmark me-2"></i> Save for later
                </button>
              </div>
              <hr class="my-3">
              <div class="text-center text-muted small">
                <div class="fw-semibold">${this.escapeHtml(m.fileName)}</div>
                <div>${this.formatFileSize(m.fileSize)} • ${this.getFileTypeLabel(m.mimeType)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event handlers
    this.addEventHandlers();
  }

  static getRatingBreakdownHTML(stats) {
    if (!stats) return '';
    
    const total = stats.rating_count || 0;
    if (total === 0) return '<p class="text-muted small">No ratings yet</p>';

    const counts = {
      5: stats.five_star || 0,
      4: stats.four_star || 0,
      3: stats.three_star || 0,
      2: stats.two_star || 0,
      1: stats.one_star || 0
    };

    return `
      <div class="rating-breakdown">
        ${[5,4,3,2,1].map(star => {
          const count = counts[star] || 0;
          const percent = total > 0 ? (count / total) * 100 : 0;
          return `
            <div class="d-flex align-items-center gap-2 small">
              <span class="text-warning" style="width: 60px;">${this.getStarsHTML(star)}</span>
              <div class="flex-grow-1" style="height: 6px;">
                <div class="bg-warning" style="width: ${percent}%; height: 100%; border-radius: 3px;"></div>
              </div>
              <span style="width: 40px; text-align: right;">${count}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  static getStarsHTML(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars += '<i class="bi bi-star-fill"></i>';
      else if (i === fullStars && hasHalf) stars += '<i class="bi bi-star-half"></i>';
      else stars += '<i class="bi bi-star"></i>';
    }
    return stars;
  }

  static addEventHandlers() {
    // Download
    document.querySelectorAll('[data-action="download"]').forEach(btn => {
      btn.addEventListener('click', () => this.downloadMaterial());
    });

    // Bookmark
    document.querySelectorAll('[data-action="bookmark"]').forEach(btn => {
      btn.addEventListener('click', () => this.toggleBookmark(btn));
    });

    // Rate
    document.querySelectorAll('[data-action="rate"]').forEach(btn => {
      btn.addEventListener('click', () => this.showRatingModal());
    });

    // Report
    document.querySelectorAll('[data-action="report"]').forEach(btn => {
      btn.addEventListener('click', () => this.showReportModal());
    });

    // Delete
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => this.confirmDelete());
    });
  }

  static async downloadMaterial() {
    try {
      const blob = await window.api.downloadMaterial(this.materialId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.material.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      window.toast.success('Download started');
    } catch (error) {
      window.toast.error('Download failed: ' + error.message);
    }
  }

  static async toggleBookmark(button) {
    try {
      const data = await window.api.toggleBookmark(this.materialId);
      const icon = button.querySelector('i');
      if (data.bookmarked) {
        icon.classList.replace('bi-bookmark', 'bi-bookmark-fill');
        button.classList.replace('btn-outline-secondary', 'btn-warning');
        window.toast.success('Added to bookmarks');
      } else {
        icon.classList.replace('bi-bookmark-fill', 'bi-bookmark');
        button.classList.replace('btn-warning', 'btn-outline-secondary');
        window.toast.success('Removed from bookmarks');
      }
    } catch (error) {
      window.toast.error('Failed to update bookmark');
    }
  }

  static showRatingModal() {
    const modalContent = `
      <form id="rating-form">
        <div class="mb-3">
          <label class="form-label">Your Rating</label>
          <div class="star-rating" role="radiogroup" aria-label="Select rating">
            ${[1,2,3,4,5].map(n => `
              <button type="button" class="btn btn-outline-secondary btn-lg star-btn" data-rating="${n}" aria-label="${n} star${n !== 1 ? 's' : ''}">
                <i class="bi bi-star"></i>
              </button>
            `).join('')}
            <input type="hidden" name="rating" id="rating-value" required>
          </div>
        </div>
        <div class="mb-3">
          <label for="rating-comment" class="form-label">Comment (optional)</label>
          <textarea class="form-control" id="rating-comment" name="comment" rows="3" placeholder="Share your thoughts..."></textarea>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Submit Rating</button>
        </div>
      </form>
    `;

    window.modal.show(modalContent, { title: 'Rate Material', size: 'sm' });

    const modalEl = document.querySelector('.modal.show');
    const stars = modalEl.querySelectorAll('.star-btn');
    const ratingInput = modalEl.querySelector('#rating-value');

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        ratingInput.value = rating;
        stars.forEach((s, i) => {
          const icon = s.querySelector('i');
          if (i < rating) {
            icon.classList.replace('bi-star', 'bi-star-fill');
            s.classList.replace('btn-outline-secondary', 'btn-warning');
          } else {
            icon.classList.replace('bi-star-fill', 'bi-star');
            s.classList.replace('btn-warning', 'btn-outline-secondary');
          }
        });
      });
    });

    modalEl.querySelector('#rating-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const rating = parseInt(ratingInput.value);
      const comment = modalEl.querySelector('#rating-comment').value;

      if (!rating) {
        window.toast.error('Please select a rating');
        return;
      }

      try {
        await window.api.rateMaterial(this.materialId, rating, comment);
        window.toast.success('Rating submitted');
        window.modal.close();
        this.loadMaterial(); // Refresh
      } catch (error) {
        window.toast.error('Failed to submit rating: ' + error.message);
      }
    });
  }

  static showReportModal() {
    const reasons = [
      { value: 'incorrect', label: 'Incorrect material' },
      { value: 'spam', label: 'Spam' },
      { value: 'duplicate', label: 'Duplicate' },
      { value: 'copyright', label: 'Copyright concern' },
      { value: 'offensive', label: 'Offensive content' },
      { value: 'malware', label: 'Malware/suspicious file' },
      { value: 'wrong_course', label: 'Wrong course' },
      { value: 'other', label: 'Other' }
    ];

    const modalContent = `
      <form id="report-form">
        <div class="mb-3">
          <label class="form-label">Reason for reporting</label>
          <select class="form-select" name="reason" required>
            <option value="">Select a reason...</option>
            ${reasons.map(r => `<option value="${r.value}">${r.label}</option>`).join('')}
          </select>
        </div>
        <div class="mb-3">
          <label for="report-description" class="form-label">Additional details (optional)</label>
          <textarea class="form-control" id="report-description" name="description" rows="3" placeholder="Provide more context..."></textarea>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-danger">Submit Report</button>
        </div>
      </form>
    `;

    window.modal.show(modalContent, { title: 'Report Material', size: 'sm' });

    document.querySelector('#report-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const reason = formData.get('reason');
      const description = formData.get('description');

      if (!reason) {
        window.toast.error('Please select a reason');
        return;
      }

      try {
        await window.api.reportMaterial(this.materialId, reason, description);
        window.toast.success('Report submitted for review');
        window.modal.close();
      } catch (error) {
        window.toast.error('Failed to submit report: ' + error.message);
      }
    });
  }

  static async confirmDelete() {
    const confirmed = await window.modal.confirm(
      'Are you sure you want to delete this material? This action cannot be undone.',
      'Delete Material',
      { confirmText: 'Delete', confirmClass: 'btn-danger' }
    );

    if (confirmed) {
      try {
        await window.api.deleteMaterial(this.materialId);
        window.toast.success('Material deleted');
        window.router.navigate('/my-uploads');
      } catch (error) {
        window.toast.error('Failed to delete: ' + error.message);
      }
    }
  }

  static getFileIcon(mimeType) {
    if (mimeType.startsWith('application/pdf')) return 'bi-file-earmark-pdf';
    if (mimeType.startsWith('application/msword') || mimeType.includes('wordprocessingml')) return 'bi-file-earmark-word';
    if (mimeType.startsWith('application/vnd.ms-powerpoint') || mimeType.includes('presentationml')) return 'bi-file-earmark-ppt';
    if (mimeType.startsWith('application/vnd.ms-excel') || mimeType.includes('spreadsheetml')) return 'bi-file-earmark-excel';
    if (mimeType.startsWith('image/')) return 'bi-file-earmark-image';
    if (mimeType === 'application/zip') return 'bi-file-earmark-zip';
    return 'bi-file-earmark';
  }

  static getFileTypeLabel(mimeType) {
    const types = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'application/vnd.ms-powerpoint': 'PPT',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
      'image/jpeg': 'JPEG',
      'image/png': 'PNG',
      'image/gif': 'GIF',
      'application/zip': 'ZIP'
    };
    return types[mimeType] || 'File';
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  static getErrorHTML() {
    return `
      <div class="empty-state">
        <i class="bi bi-exclamation-triangle"></i>
        <h4>Material not found</h4>
        <p>The material you're looking for doesn't exist or has been removed.</p>
        <a href="/search" class="btn btn-primary mt-3" data-link>Back to Search</a>
      </div>
    `;
  }

  static escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}