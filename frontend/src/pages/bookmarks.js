export class BookmarksPage {
  static template() {
    return `
      <div class="container-fluid">
        <h1 class="h3 mb-4">My Bookmarks</h1>

        <div class="row g-3" id="bookmarks-container" role="list" aria-label="Bookmarked materials">
          <!-- Bookmarks loaded here -->
        </div>

        <div class="empty-state d-none" id="empty-state">
          <i class="bi bi-bookmark"></i>
          <h4>No bookmarks yet</h4>
          <p>Save materials for later by clicking the bookmark icon</p>
          <a href="/search" class="btn btn-primary mt-3" data-link>Browse Materials</a>
        </div>
      </div>
    `;
  }

  static async init() {
    await this.loadBookmarks();
  }

  static async loadBookmarks() {
    const container = document.getElementById('bookmarks-container');
    const emptyState = document.getElementById('empty-state');

    container.innerHTML = this.getLoadingHTML();
    emptyState.classList.add('d-none');

    try {
      const data = await window.api.getBookmarks();
      this.bookmarks = data.bookmarks || [];
      this.renderBookmarks();
      emptyState.classList.toggle('d-none', this.bookmarks.length > 0);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      container.innerHTML = this.getErrorHTML();
    }
  }

  static renderBookmarks() {
    const container = document.getElementById('bookmarks-container');
    if (!container) return;

    container.innerHTML = this.bookmarks.map(b => this.getCardHTML(b.material)).join('');

    container.querySelectorAll('[data-action="remove-bookmark"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.materialId;
        this.removeBookmark(id);
      });
    });

    container.querySelectorAll('[data-action="download"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.materialId;
        this.downloadMaterial(id);
      });
    });
  }

  static getCardHTML(material) {
    if (!material) return '';

    const rating = material.averageRating > 0 ? this.getStarsHTML(material.averageRating) : '';

    return `
      <div class="col-12 col-md-6 col-lg-4" role="listitem">
        <article class="card material-card h-100" data-material-id="${material.id}" tabindex="0" role="button" aria-label="View ${this.escapeHtml(material.title)}">
          <div class="material-card-header">
            ${material.materialType ? `<span class="material-type-badge"><i class="bi bi-${material.materialType.icon || 'file'}"></i> ${this.escapeHtml(material.materialType.name)}</span>` : ''}
            <button class="btn btn-sm btn-outline-danger" data-action="remove-bookmark" data-material-id="${material.id}" aria-label="Remove from bookmarks">
              <i class="bi bi-bookmark-fill"></i>
            </button>
          </div>
          <div class="material-card-body">
            <h5 class="material-title">${this.escapeHtml(material.title)}</h5>
            <div class="material-meta">
              <span class="material-meta-item"><i class="bi bi-journal-text"></i> ${this.escapeHtml(material.course?.name || 'Unknown Course')}</span>
              <span class="material-meta-item"><i class="bi bi-calendar"></i> ${material.academicYear || 'N/A'}</span>
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
              <a href="/material/${material.id}" class="btn btn-sm btn-outline-secondary" data-link>
                <i class="bi bi-eye"></i>
              </a>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  static async removeBookmark(materialId) {
    try {
      await window.api.toggleBookmark(materialId);
      window.toast.success('Removed from bookmarks');
      this.loadBookmarks();
    } catch (error) {
      window.toast.error('Failed to remove bookmark');
    }
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

  static getLoadingHTML() {
    return Array(4).fill(0).map(() => `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="skeleton" style="height: 120px;"></div>
          <div class="card-body">
            <div class="skeleton" style="height: 1.5rem; width: 80%; margin-bottom: 0.5rem;"></div>
            <div class="skeleton" style="height: 1rem; width: 60%; margin-bottom: 1rem;"></div>
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
          <h4>Failed to load bookmarks</h4>
          <button class="btn btn-primary mt-3" onclick="window.bookmarksPage.loadBookmarks()">Retry</button>
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

window.bookmarksPage = new BookmarksPage();