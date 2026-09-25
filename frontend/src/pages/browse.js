export class BrowsePage {
  static template() {
    return `
      <div class="course-browser">
        <nav aria-label="Breadcrumb" class="breadcrumb-nav">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a href="/" data-link>Home</a></li>
            <li class="breadcrumb-item active" aria-current="page">Browse Courses</li>
          </ol>
        </nav>

        <h1 class="h3 mb-4">Browse by Course</h1>

        <div id="browser-content">
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
    this.currentLevel = 'universities';
    this.selectedPath = {};
    await this.loadLevel();
  }

  static async loadLevel() {
    const container = document.getElementById('browser-content');
    if (!container) return;

    try {
      let data;
      let title;
      let items = [];

      switch (this.currentLevel) {
        case 'universities':
          data = await window.api.getUniversities();
          items = data.universities || [];
          title = 'Select University';
          break;
        case 'colleges':
          data = await window.api.getColleges(this.selectedPath.universityId);
          items = data.colleges || [];
          title = 'Select College/School';
          break;
        case 'programs':
          data = await window.api.getPrograms(this.selectedPath.collegeId);
          items = data.programs || [];
          title = 'Select Program';
          break;
        case 'years':
          items = this.getYearsForProgram(this.selectedPath.programId);
          title = 'Select Year';
          break;
        case 'semesters':
          items = [
            { id: 1, name: 'Semester I' },
            { id: 2, name: 'Semester II' }
          ];
          title = 'Select Semester';
          break;
        case 'courses':
          data = await window.api.getCoursesByYearSemester(
            this.selectedPath.programId,
            this.selectedPath.year,
            this.selectedPath.semester
          );
          items = data.courses || [];
          title = 'Select Course';
          break;
      }

      this.renderLevel(container, title, items);
    } catch (error) {
      console.error('Failed to load level:', error);
      container.innerHTML = this.getErrorHTML();
    }
  }

  static getYearsForProgram(programId) {
    // We'll fetch the program details to get duration
    return [
      { id: 1, name: 'Year 1' },
      { id: 2, name: 'Year 2' },
      { id: 3, name: 'Year 3' },
      { id: 4, name: 'Year 4' },
      { id: 5, name: 'Year 5' }
    ];
  }

  static renderLevel(container, title, items) {
    const breadcrumbs = this.getBreadcrumbs();
    
    container.innerHTML = `
      ${breadcrumbs}
      <h2 class="h4 mb-4">${this.escapeHtml(title)}</h2>
      ${items.length === 0 ? this.getEmptyHTML() : this.getGridHTML(items)}
    `;

    // Add click handlers
    container.querySelectorAll('.level-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const id = card.dataset.id;
        const name = card.dataset.name;
        this.selectItem(id, name);
      });
    });
  }

  static getBreadcrumbs() {
    const levels = [
      { key: 'universities', label: 'Universities', id: 'universityId', name: 'universityName' },
      { key: 'colleges', label: 'Colleges', id: 'collegeId', name: 'collegeName' },
      { key: 'programs', label: 'Programs', id: 'programId', name: 'programName' },
      { key: 'years', label: 'Years', id: 'year', name: 'yearName' },
      { key: 'semesters', label: 'Semesters', id: 'semester', name: 'semesterName' }
    ];

    let html = '<nav aria-label="Breadcrumb" class="breadcrumb-nav"><ol class="breadcrumb mb-3">';
    html += '<li class="breadcrumb-item"><a href="/" data-link>Home</a></li>';
    html += '<li class="breadcrumb-item"><a href="/browse" data-link>Browse</a></li>';

    for (const level of levels) {
      if (this.currentLevel === level.key) {
        html += `<li class="breadcrumb-item active" aria-current="page">${this.escapeHtml(level.label)}</li>`;
        break;
      }
      if (this.selectedPath[level.id]) {
        const name = this.selectedPath[level.name] || this.selectedPath[level.id];
        html += `<li class="breadcrumb-item"><a href="#" data-level="${level.key}" class="breadcrumb-link">${this.escapeHtml(name)}</a></li>`;
      }
    }

    html += '</ol></nav>';
    return html;
  }

  static getGridHTML(items) {
    return `
      <div class="row g-3" id="level-grid">
        ${items.map(item => `
          <div class="col-6 col-md-4 col-lg-3">
            <div class="level-card h-100" data-id="${item.id}" data-name="${this.escapeHtml(item.name)}" role="button" tabindex="0" aria-label="Select ${this.escapeHtml(item.name)}">
              <div class="level-card-icon">
                ${this.getIconForLevel(this.currentLevel)}
              </div>
              <h6 class="level-card-title">${this.escapeHtml(item.name)}</h6>
              ${item.code ? `<p class="level-card-subtitle">${this.escapeHtml(item.code)}</p>` : ''}
              ${item.duration_years ? `<p class="level-card-subtitle">${item.duration_years} years</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  static getIconForLevel(level) {
    const icons = {
      universities: '<i class="bi bi-building"></i>',
      colleges: '<i class="bi bi-building-fill"></i>',
      programs: '<i class="bi bi-book"></i>',
      years: '<i class="bi bi-calendar3"></i>',
      semesters: '<i class="bi bi-calendar2"></i>',
      courses: '<i class="bi bi-journal-text"></i>'
    };
    return icons[level] || '<i class="bi bi-folder"></i>';
  }

  static getEmptyHTML() {
    return `
      <div class="empty-state">
        <i class="bi bi-folder"></i>
        <h4>No items found</h4>
        <p>There are no items at this level yet.</p>
      </div>
    `;
  }

  static getErrorHTML() {
    return `
      <div class="empty-state">
        <i class="bi bi-exclamation-triangle"></i>
        <h4>Failed to load</h4>
        <p>Unable to load data. Please try again.</p>
        <button class="btn btn-primary mt-3" onclick="window.location.reload()">Retry</button>
      </div>
    `;
  }

  static selectItem(id, name) {
    const levelMap = {
      'universities': { next: 'colleges', idKey: 'universityId', nameKey: 'universityName' },
      'colleges': { next: 'programs', idKey: 'collegeId', nameKey: 'collegeName' },
      'programs': { next: 'years', idKey: 'programId', nameKey: 'programName' },
      'years': { next: 'semesters', idKey: 'year', nameKey: 'yearName' },
      'semesters': { next: 'courses', idKey: 'semester', nameKey: 'semesterName' },
      'courses': { next: null, idKey: 'courseId', nameKey: 'courseName' }
    };

    const mapping = levelMap[this.currentLevel];
    this.selectedPath[mapping.idKey] = id;
    this.selectedPath[mapping.nameKey] = name;

    if (mapping.next) {
      this.currentLevel = mapping.next;
      this.loadLevel();
    } else {
      // Navigate to course materials
      window.router.navigate(`/search?courseId=${id}`);
    }
  }

  static escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}