export class SearchPage {
  static template() {
    return `
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 class="h3 mb-1">Search Materials</h1>
            <p class="text-muted mb-0">Find lecture notes, past exams, assignments, and more</p>
          </div>
          <a href="/upload" class="btn btn-primary" data-link>
            <i class="bi bi-upload me-2"></i> Upload Material
          </a>
        </div>

        <!-- Search & Filters -->
        <div class="search-filters" id="search-filters">
          <div class="row g-3 align-items-end">
            <div class="col-12 col-lg-6">
              <label for="search-input" class="form-label visually-hidden">Search materials</label>
              <div class="search-input-group">
                <i class="bi bi-search"></i>
                <input type="search" class="form-control" id="search-input" placeholder="Search by title, course, uploader..." aria-label="Search materials">
              </div>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <label for="filter-type" class="form-label">Type</label>
              <select class="form-select" id="filter-type" aria-label="Material type">
                <option value="">All Types</option>
              </select>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <label for="filter-year" class="form-label">Academic Year</label>
              <select class="form-select" id="filter-year" aria-label="Academic year">
                <option value="">All Years</option>
              </select>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <label for="sort-by" class="form-label">Sort By</label>
              <select class="form-select" id="sort-by" aria-label="Sort by">
                <option value="created_at">Newest</option>
                <option value="title">Title</option>
                <option value="download_count">Most Downloaded</option>
                <option value="average_rating">Highest Rated</option>
              </select>
            </div>
          </div>

          <div class="filter-tags" id="active-filters"></div>
        </div>

        <!-- Results -->
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2" id="results-header">
          <div>
            <span class="text-muted" id="results-count">Loading...</span>
          </div>
          <div class="btn-group" role="group" aria-label="View options">
            <button type="button" class="btn btn-outline-secondary btn-sm active" data-view="grid" aria-pressed="true">
              <i class="bi bi-grid"></i>
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm" data-view="list" aria-pressed="false">
              <i class="bi bi-list"></i>
            </button>
          </div>
        </div>

        <div class="row g-3" id="results-container" role="list" aria-label="Search results">
          <!-- Results loaded here -->
        </div>

        <!-- Pagination -->
        <nav aria-label="Pagination" class="mt-4" id="pagination-container">
          <!-- Pagination loaded here -->
        </nav>

        <!-- Empty State -->
        <div class="empty-state d-none" id="empty-state">
          <i class="bi bi-search"></i>
          <h4>No materials found</h4>
          <p>Try adjusting your search or filters</p>
          <a href="/upload" class="btn btn-primary mt-3" data-link>Upload the first material</a>
        </div>
      </div>
    `;
  }

  static async init() {
    this.currentView = 'grid';
    this.filters = {
      search: '',
      courseId: null,
      materialTypeId: null,
      academicYear: null,
      semester: null,
      universityId: null,
      programId: null,
      year: null,
      courseSemester: null,
      sortBy: 'created_at',
      sortOrder: 'desc',
      limit: 20,
      offset: 0
    };

    this.materialTypes = [];
    await this.loadMaterialTypes();
    this.setupEventListeners();
    this.parseUrlParams();
    await this.loadResults();
  }

  static async loadMaterialTypes() {
    try {
      const data = await window.api.getMaterialTypes();
      this.materialTypes = data.types || [];
      this.populateTypeFilter();
    } catch (error) {
      console.error('Failed to load material types:', error);
    }
  }

  static populateTypeFilter() {
    const select = document.getElementById('filter-type');
    if (select && this.materialTypes.length) {
      select.innerHTML = '<option value="">All Types</option>' +
        this.materialTypes.map(t => `<option value="${t.id}">${this.escapeHtml(t.name)}</option>`).join('');
    }
  }

  static parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('courseId')) {
      this.filters.courseId = params.get('courseId');
    }
    if (params.get('search')) {
      this.filters.search = params.get('search');
      document.getElementById('search-input').value = this.filters.search;
    }
    if (params.get('type')) {
      this.filters.materialTypeId = params.get('type');
      document.getElementById('filter-type').value = this.filters.materialTypeId;
    }
  }

  static setupEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.filters.search = searchInput.value.trim();
        this.filters.offset = 0;
        this.updateUrl();
        this.loadResults();
      }, 300);
    });

    // Filter changes
    document.getElementById('filter-type').addEventListener('change', (e) => {
      this.filters.materialTypeId = e.target.value || null;
      this.filters.offset = 0;
      this.updateUrl();
      this.loadResults();
    });

    document.getElementById('sort-by').addEventListener('change', (e) => {
      this.filters.sortBy = e.target.value;
      this.filters.offset = 0;
      this.loadResults();
    });

    // View toggle
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentView = btn.dataset.view;
        document.querySelectorAll('[data-view]').forEach(b => {
          b.classList.toggle('active', b.dataset.view === this.currentView);
          b.setAttribute('aria-pressed', b.dataset.view === this.currentView);
        });
        this.renderResults();
      });
    });
  }

  static async loadResults() {
    const container = document.getElementById('results-container');
    const countEl = document.getElementById('results-count');
    const emptyState = document.getElementById('empty-state');
    const paginationContainer = document.getElementById('pagination-container');

    // Show loading
    container.innerHTML = this.getLoadingHTML();
    emptyState.classList.add('d-none');
    paginationContainer.innerHTML = '';

    try {
      const data = await window.api.getMaterials(this.filters);
      
      this.lastResults = data.materials || [];
      this.totalResults = data.total || 0;
      this.currentPage = Math.floor(this.filters.offset / this.filters.limit) + 1;
      this.totalPages = Math.ceil(this.totalResults / this.filters.limit);

      // Update count
      countEl.textContent = `${this.totalResults} material${this.totalResults !== 1 ? 's' : ''} found`;

      // Update active filters
      this.updateActiveFilters();

      // Render
      this.renderResults();

      // Render pagination
      if (this.totalPages > 1) {
        this.renderPagination(paginationContainer);
      }

      // Show/hide empty state
      emptyState.classList.toggle('d-none', this.lastResults.length > 0);

    } catch (error) {
      console.error('Search failed:', error);
      container.innerHTML = this.getErrorHTML();
      emptyState.classList.add('d-none');
    }
  }

  static renderResults() {
    const container = document.getElementById('results-container');
    if (!container) return;

    if (this.currentView === 'grid') {
      container.className = 'row g-3';
      container.innerHTML = this.lastResults.map(material => this.getCardHTML(material)).join('');
    } else {
      container.className = 'list-group';
      container.innerHTML = this.lastResults.map(material => this.getListHTML(material)).join('');
    }

    // Add click handlers for cards
    container.querySelectorAll('.material-card, .material-list-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('button, a')) return;
        const id = el.dataset.materialId;
        if (id) window.router.navigate(`/material/${id}`);
      });
    });

    // Add bookmark handlers
    container.querySelectorAll('[data-action="bookmark"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.materialId;
        this.toggleBookmark(id, btn);
      });
    });

    // Add download handlers
    container.querySelectorAll('[data-action="download"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.materialId;
        this.downloadMaterial(id);
      });
    });

    // Add rating handlers
    container.querySelectorAll('[data-action="rate"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.materialId;
        this.showRatingModal(id);
      });
    });

    // Add report handlers
    container.querySelectorAll('[data-action="report"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.materialId;
        this.showReportModal(id);
      });
    });
  }

  static getCardHTML(material) {
    const rating = material.averageRating > 0 ? this.getStarsHTML(material.averageRating) : '';
    const typeBadge = material.materialType ? `<span class="material-type-badge"><i class="bi bi-${material.materialType.icon || 'file'}"></i> ${this.escapeHtml(material.materialType.name)}</span>` : '';
    
    return `
      <div class="col-12 col-md-6 col-lg-4" role="listitem">
        <article class="card material-card h-100" data-material-id="${material.id}" tabindex="0" role="button" aria-label="View ${this.escapeHtml(material.title)}">
          <div class="material-card-header">
            ${typeBadge}
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown" aria-expanded="false" aria-label="More options">
                <i class="bi bi-three-dots"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="/material/${material.id}" data-link>View Details</a></li>
                <li><button class="dropdown-item" data-action="download" data-material-id="${material.id}"><i class="bi bi-download me-2"></i>Download</button></li>
                <li><button class="dropdown-item" data-action="bookmark" data-material-id="${material.id}"><i class="bi bi-bookmark me-2"></i>Bookmark</button></li>
                <li><button class="dropdown-item" data-action="rate" data-material-id="${material.id}"><i class="bi bi-star me-2"></i>Rate</button></li>
                <li><button class="dropdown-item text-danger" data-action="report" data-material-id="${material.id}"><i class="bi bi-flag me-2"></i>Report</button></li>
              </ul>
            </div>
          </div>
          <div class="material-card-body">
            <h5 class="material-title">${this.escapeHtml(material.title)}</h5>
            <div class="material-meta">
              <span class="material-meta-item"><i class="bi bi-journal-text"></i> ${this.escapeHtml(material.course?.name || 'Unknown Course')}</span>
              <span class="material-meta-item"><i class="bi bi-calendar"></i> ${material.academicYear || 'N/A'}</span>
              ${material.semester ? `<span class="material-meta-item"><i class="bi bi-calendar2"></i> Semester ${material.semester}</span>` : ''}
            </div>
            ${material.description ? `<p class="material-description">${this.escapeHtml(material.description)}</p>` : ''}
          </div>
          <div class="material-card-footer">
            <div class="material-stats">
              <span class="material-stat"><i class="bi bi-download"></i> ${this.formatNumber(material.downloadCount)}</span>
              ${rating ? `<span class="material-stat rating-stars">${rating} ${material.averageRating.toFixed(1)}</span>` : ''}
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" data-action="download" data-material-id="${material.id}" aria-label="Download ${this.escapeHtml(material.title)}">
                <i class="bi bi-download"></i>
              </button>
              <button class="btn btn-sm btn-outline-secondary" data-action="bookmark" data-material-id="${material.id}" aria-label="Bookmark ${this.escapeHtml(material.title)}">
                <i class="bi bi-bookmark"></i>
              </button>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  static getListHTML(material) {
    const rating = material.averageRating > 0 ? this.getStarsHTML(material.averageRating) : '';
    
    return `
      <div class="list-group-item material-list-item d-flex align-items-center gap-3" data-material-id="${material.id}" role="listitem" tabindex="0">
        <div class="flex-shrink-0">
          <i class="bi bi-file-earmark-text text-primary" style="font-size: 2rem;"></i>
        </div>
        <div class="flex-grow-1 min-width-0">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <h6 class="mb-0 fw-semibold">${this.escapeHtml(material.title)}</h6>
            <div class="dropdown ms-2">
              <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown" aria-expanded="false" aria-label="More options">
                <i class="bi bi-three-dots"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="/material/${material.id}" data-link>View Details</a></li>
                <li><button class="dropdown-item" data-action="download" data-material-id="${material.id}"><i class="bi bi-download me-2"></i>Download</button></li>
                <li><button class="dropdown-item" data-action="bookmark" data-material-id="${material.id}"><i class="bi bi-bookmark me-2"></i>Bookmark</button></li>
                <li><button class="dropdown-item" data-action="rate" data-material-id="${material.id}"><i class="bi bi-star me-2"></i>Rate</button></li>
                <li><button class="dropdown-item text-danger" data-action="report" data-material-id="${material.id}"><i class="bi bi-flag me-2"></i>Report</button></li>
              </ul>
            </div>
          </div>
          <div class="material-meta mb-1">
            <span class="material-meta-item"><i class="bi bi-journal-text"></i> ${this.escapeHtml(material.course?.name || 'Unknown Course')}</span>
            <span class="material-meta-item"><i class="bi bi-calendar"></i> ${material.academicYear || 'N/A'}</span>
            ${material.semester ? `<span class="material-meta-item"><i class="bi bi-calendar2"></i> Semester ${material.semester}</span>` : ''}
            ${material.materialType ? `<span class="material-meta-item material-type-badge"><i class="bi bi-${material.materialType.icon || 'file'}"></i> ${this.escapeHtml(material.materialType.name)}</span>` : ''}
          </div>
          <div class="material-stats">
            <span class="material-stat"><i class="bi bi-download"></i> ${this.formatNumber(material.downloadCount)} downloads</span>
            ${rating ? `<span class="material-stat rating-stars">${rating} ${material.averageRating.toFixed(1)} (${material.ratingCount})</span>` : ''}
            <span class="material-stat"><i class="bi bi-person"></i> ${this.escapeHtml(material.uploader?.name || 'Unknown')}</span>
          </div>
        </div>
        <div class="flex-shrink-0 d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" data-action="download" data-material-id="${material.id}" aria-label="Download ${this.escapeHtml(material.title)}">
            <i class="bi bi-download"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary" data-action="bookmark" data-material-id="${material.id}" aria-label="Bookmark ${this.escapeHtml(material.title)}">
            <i class="bi bi-bookmark"></i>
          </button>
        </div>
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

  static updateActiveFilters() {
    const container = document.getElementById('active-filters');
    if (!container) return;

    const tags = [];

    if (this.filters.search) {
      tags.push({ label: `Search: "${this.filters.search}"`, key: 'search' });
    }
    if (this.filters.materialTypeId) {
      const type = this.materialTypes.find(t => t.id === this.filters.materialTypeId);
      tags.push({ label: `Type: ${type?.name || this.filters.materialTypeId}`, key: 'materialTypeId' });
    }
    if (this.filters.academicYear) {
      tags.push({ label: `Year: ${this.filters.academicYear}`, key: 'academicYear' });
    }
    if (this.filters.semester) {
      tags.push({ label: `Semester: ${this.filters.semester}`, key: 'semester' });
    }

    container.innerHTML = tags.map(tag => `
      <span class="filter-tag">
        ${this.escapeHtml(tag.label)}
        <button type="button" class="btn-close" data-filter="${tag.key}" aria-label="Remove filter"></button>
      </span>
    `).join('');

    container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filters[btn.dataset.filter] = null;
        this.filters.offset = 0;
        this.updateUrl();
        this.loadResults();
      });
    });
  }

  static renderPagination(container) {
    let html = '<ul class="pagination justify-content-center">';
    
    // Previous
    html += `<li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${this.currentPage - 1}" aria-label="Previous"><i class="bi bi-chevron-left"></i></a>
    </li>`;

    // Page numbers
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    
    for (let i = start; i <= end; i++) {
      html += `<li class="page-item ${i === this.currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
    }

    // Next
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
          this.loadResults();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  static updateUrl() {
    const params = new URLSearchParams();
    Object.entries(this.filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value);
      }
    });
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }

  static async toggleBookmark(materialId, button) {
    try {
      const data = await window.api.toggleBookmark(materialId);
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

  static async downloadMaterial(materialId) {
    try {
      const blob = await window.api.downloadMaterial(materialId);
      
      // Get filename from response headers or use default
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ''; // Will use server-provided filename
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      window.toast.success('Download started');
    } catch (error) {
      window.toast.error('Download failed: ' + error.message);
    }
  }

  static showRatingModal(materialId) {
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

    // Star rating interaction
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

    // Form submit
    modalEl.querySelector('#rating-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const rating = parseInt(ratingInput.value);
      const comment = modalEl.querySelector('#rating-comment').value;

      if (!rating) {
        window.toast.error('Please select a rating');
        return;
      }

      try {
        await window.api.rateMaterial(materialId, rating, comment);
        window.toast.success('Rating submitted');
        window.modal.close();
        this.loadResults(); // Refresh
      } catch (error) {
        window.toast.error('Failed to submit rating: ' + error.message);
      }
    });
  }

  static showReportModal(materialId) {
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
        await window.api.reportMaterial(materialId, reason, description);
        window.toast.success('Report submitted for review');
        window.modal.close();
      } catch (error) {
        window.toast.error('Failed to submit report: ' + error.message);
      }
    });
  }

  static getLoadingHTML() {
    return Array(6).fill(0).map(() => `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="skeleton" style="height: 120px;"></div>
          <div class="card-body">
            <div class="skeleton" style="height: 1.5rem; width: 80%; margin-bottom: 0.5rem;"></div>
            <div class="skeleton" style="height: 1rem; width: 60%; margin-bottom: 0.5rem;"></div>
            <div class="skeleton" style="height: 1rem; width: 40%; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="height: 3rem; width: 100%;"></div>
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
          <h4>Failed to load results</h4>
          <button class="btn btn-primary mt-3" onclick="window.searchPage.loadResults()">Retry</button>
        </div>
      </div>
    `;
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

// Make instance globally accessible for inline handlers
window.searchPage = new SearchPage();