export class AdminAcademicPage {
  static template() {
    return `
      <div class="container-fluid">
        <h1 class="h3 mb-4">Academic Structure</h1>

        <ul class="nav nav-tabs mb-4" id="academic-tabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="universities-tab" data-bs-toggle="tab" data-bs-target="#universities" type="button" role="tab">Universities</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="colleges-tab" data-bs-toggle="tab" data-bs-target="#colleges" type="button" role="tab">Colleges/Schools</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="programs-tab" data-bs-toggle="tab" data-bs-target="#programs" type="button" role="tab">Programs</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="courses-tab" data-bs-toggle="tab" data-bs-target="#courses" type="button" role="tab">Courses</button>
          </li>
        </ul>

        <div class="tab-content" id="academic-tab-content">
          <!-- Universities -->
          <div class="tab-pane fade show active" id="universities" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0">Universities</h5>
              <button class="btn btn-primary btn-sm" data-action="add-university"><i class="bi bi-plus me-1"></i> Add University</button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover" id="universities-table">
                <thead>
                  <tr><th>Name</th><th>Code</th><th>Description</th><th>Status</th><th style="width: 120px;">Actions</th></tr>
                </thead>
                <tbody id="universities-body"><tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr></tbody>
              </table>
            </div>
          </div>

          <!-- Colleges -->
          <div class="tab-pane fade" id="colleges" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0">Colleges/Schools</h5>
              <button class="btn btn-primary btn-sm" data-action="add-college"><i class="bi bi-plus me-1"></i> Add College</button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover" id="colleges-table">
                <thead>
                  <tr><th>Name</th><th>Code</th><th>University</th><th>Description</th><th>Status</th><th style="width: 120px;">Actions</th></tr>
                </thead>
                <tbody id="colleges-body"><tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr></tbody>
              </table>
            </div>
          </div>

          <!-- Programs -->
          <div class="tab-pane fade" id="programs" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0">Programs</h5>
              <button class="btn btn-primary btn-sm" data-action="add-program"><i class="bi bi-plus me-1"></i> Add Program</button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover" id="programs-table">
                <thead>
                  <tr><th>Name</th><th>Code</th><th>College</th><th>Duration</th><th>Status</th><th style="width: 120px;">Actions</th></tr>
                </thead>
                <tbody id="programs-body"><tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr></tbody>
              </table>
            </div>
          </div>

          <!-- Courses -->
          <div class="tab-pane fade" id="courses" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0">Courses</h5>
              <button class="btn btn-primary btn-sm" data-action="add-course"><i class="bi bi-plus me-1"></i> Add Course</button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover" id="courses-table">
                <thead>
                  <tr><th>Name</th><th>Code</th><th>Program</th><th>Year</th><th>Semester</th><th>Credits</th><th>Status</th><th style="width: 120px;">Actions</th></tr>
                </thead>
                <tbody id="courses-body"><tr><td colspan="8" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static async init() {
    await Promise.all([
      this.loadUniversities(),
      this.loadColleges(),
      this.loadPrograms(),
      this.loadCourses()
    ]);

    this.setupEventListeners();
  }

  static setupEventListeners() {
    // Add buttons
    document.querySelectorAll('[data-action="add-university"]').forEach(btn => {
      btn.addEventListener('click', () => this.showUniversityModal());
    });
    document.querySelectorAll('[data-action="add-college"]').forEach(btn => {
      btn.addEventListener('click', () => this.showCollegeModal());
    });
    document.querySelectorAll('[data-action="add-program"]').forEach(btn => {
      btn.addEventListener('click', () => this.showProgramModal());
    });
    document.querySelectorAll('[data-action="add-course"]').forEach(btn => {
      btn.addEventListener('click', () => this.showCourseModal());
    });
  }

  // ============ Universities ============
  static async loadUniversities() {
    try {
      const data = await window.api.getUniversities();
      this.universities = data.universities || [];
      this.renderUniversities();
    } catch (error) {
      console.error('Failed to load universities:', error);
    }
  }

  static renderUniversities() {
    const tbody = document.getElementById('universities-body');
    if (!tbody) return;

    tbody.innerHTML = this.universities.map(u => `
      <tr>
        <td>${this.escapeHtml(u.name)}</td>
        <td><code>${this.escapeHtml(u.code)}</code></td>
        <td>${this.escapeHtml(u.description || '')}</td>
        <td><span class="badge ${u.isActive ? 'bg-success' : 'bg-secondary'}">${u.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" data-action="edit-university" data-id="${u.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-outline-danger" data-action="delete-university" data-id="${u.id}"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="text-center text-muted py-4">No universities</td></tr>';

    tbody.querySelectorAll('[data-action="edit-university"]').forEach(btn => {
      btn.addEventListener('click', () => this.showUniversityModal(btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="delete-university"]').forEach(btn => {
      btn.addEventListener('click', () => this.confirmDeleteUniversity(btn.dataset.id));
    });
  }

  static showUniversityModal(universityId = null) {
    const isEdit = !!universityId;
    const university = isEdit ? this.universities.find(u => u.id === universityId) : null;

    const modalContent = `
      <form id="university-form">
        <input type="hidden" name="id" value="${university?.id || ''}">
        <div class="mb-3">
          <label class="form-label">Name <span class="required-indicator">*</span></label>
          <input type="text" class="form-control" name="name" value="${this.escapeHtml(university?.name || '')}" required maxlength="255">
        </div>
        <div class="mb-3">
          <label class="form-label">Code <span class="required-indicator">*</span></label>
          <input type="text" class="form-control" name="code" value="${this.escapeHtml(university?.code || '')}" required maxlength="50" pattern="[A-Z0-9]+" ${isEdit ? 'readonly' : ''}>
          <div class="form-text">Uppercase alphanumeric only${isEdit ? ' (cannot be changed)' : ''}</div>
        </div>
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" name="description" rows="3">${this.escapeHtml(university?.description || '')}</textarea>
        </div>
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="isActive" id="uni-active" ${university?.isActive !== false ? 'checked' : ''}>
          <label class="form-check-label" for="uni-active">Active</label>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'} University</button>
        </div>
      </form>
    `;

    window.modal.show(modalContent, { title: isEdit ? 'Edit University' : 'Add University', size: 'md' });

    document.getElementById('university-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        name: formData.get('name').trim(),
        code: formData.get('code').trim().toUpperCase(),
        description: formData.get('description')?.trim() || undefined,
        isActive: formData.get('isActive') === 'on'
      };

      try {
        if (isEdit) {
          await window.api.updateUniversity(universityId, data);
          window.toast.success('University updated');
        } else {
          await window.api.createUniversity(data);
          window.toast.success('University created');
        }
        window.modal.close();
        this.loadUniversities();
      } catch (error) {
        window.toast.error('Failed to save university: ' + error.message);
      }
    });
  }

  static async confirmDeleteUniversity(id) {
    const university = this.universities.find(u => u.id === id);
    const confirmed = await window.modal.confirm(
      `Delete "${this.escapeHtml(university?.name)}"? This will also delete all associated colleges, programs, and courses.`,
      'Delete University',
      { confirmText: 'Delete', confirmClass: 'btn-danger' }
    );

    if (confirmed) {
      try {
        await window.api.deleteUniversity(id);
        window.toast.success('University deleted');
        this.loadUniversities();
      } catch (error) {
        window.toast.error('Failed to delete: ' + error.message);
      }
    }
  }

  // ============ Colleges ============
  static async loadColleges() {
    try {
      const hierarchyData = await window.api.getHierarchy();
      this.colleges = [];
      if (hierarchyData.hierarchy) {
        hierarchyData.hierarchy.forEach(uni => {
          uni.colleges?.forEach(college => {
            this.colleges.push({ ...college, universityName: uni.name, universityId: uni.id });
          });
        });
      }
      this.renderColleges();
    } catch (error) {
      console.error('Failed to load colleges:', error);
    }
  }

  static renderColleges() {
    const tbody = document.getElementById('colleges-body');
    if (!tbody) return;

    tbody.innerHTML = this.colleges.map(c => `
      <tr>
        <td>${this.escapeHtml(c.name)}</td>
        <td><code>${this.escapeHtml(c.code)}</code></td>
        <td>${this.escapeHtml(c.universityName)}</td>
        <td>${this.escapeHtml(c.description || '')}</td>
        <td><span class="badge ${c.isActive ? 'bg-success' : 'bg-secondary'}">${c.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" data-action="edit-college" data-id="${c.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-outline-danger" data-action="delete-college" data-id="${c.id}"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="text-center text-muted py-4">No colleges</td></tr>';

    tbody.querySelectorAll('[data-action="edit-college"]').forEach(btn => {
      btn.addEventListener('click', () => this.showCollegeModal(btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="delete-college"]').forEach(btn => {
      btn.addEventListener('click', () => this.confirmDeleteCollege(btn.dataset.id));
    });
  }

  static showCollegeModal(collegeId = null) {
    const isEdit = !!collegeId;
    const college = isEdit ? this.colleges.find(c => c.id === collegeId) : null;

    const modalContent = `
      <form id="college-form">
        <input type="hidden" name="id" value="${college?.id || ''}">
        <div class="mb-3">
          <label class="form-label">University <span class="required-indicator">*</span></label>
          <select class="form-select" name="universityId" required ${isEdit ? 'disabled' : ''}>
            <option value="">Select university...</option>
            ${this.universities.map(u => `<option value="${u.id}" ${college?.universityId === u.id ? 'selected' : ''}>${this.escapeHtml(u.name)}</option>`).join('')}
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Name <span class="required-indicator">*</span></label>
          <input type="text" class="form-control" name="name" value="${this.escapeHtml(college?.name || '')}" required maxlength="255">
        </div>
        <div class="mb-3">
          <label class="form-label">Code <span class="required-indicator">*</span></label>
          <input type="text" class="form-control" name="code" value="${this.escapeHtml(college?.code || '')}" required maxlength="50" pattern="[A-Z0-9]+" ${isEdit ? 'readonly' : ''}>
          <div class="form-text">Uppercase alphanumeric only</div>
        </div>
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" name="description" rows="3">${this.escapeHtml(college?.description || '')}</textarea>
        </div>
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="isActive" id="col-active" ${college?.isActive !== false ? 'checked' : ''}>
          <label class="form-check-label" for="col-active">Active</label>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'} College</button>
        </div>
      </form>
    `;

    window.modal.show(modalContent, { title: isEdit ? 'Edit College' : 'Add College', size: 'md' });

    document.getElementById('college-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        universityId: formData.get('universityId'),
        name: formData.get('name').trim(),
        code: formData.get('code').trim().toUpperCase(),
        description: formData.get('description')?.trim() || undefined,
        isActive: formData.get('isActive') === 'on'
      };

      try {
        if (isEdit) {
          await window.api.updateCollege(collegeId, data);
          window.toast.success('College updated');
        } else {
          await window.api.createCollege(data);
          window.toast.success('College created');
        }
        window.modal.close();
        this.loadColleges();
      } catch (error) {
        window.toast.error('Failed to save college: ' + error.message);
      }
    });
  }

  static async confirmDeleteCollege(id) {
    const college = this.colleges.find(c => c.id === id);
    const confirmed = await window.modal.confirm(
      `Delete "${this.escapeHtml(college?.name)}"? This will also delete all associated programs and courses.`,
      'Delete College',
      { confirmText: 'Delete', confirmClass: 'btn-danger' }
    );

    if (confirmed) {
      try {
        await window.api.deleteCollege(id);
        window.toast.success('College deleted');
        this.loadColleges();
      } catch (error) {
        window.toast.error('Failed to delete: ' + error.message);
      }
    }
  }

  // ============ Programs ============
  static async loadPrograms() {
    try {
      const data = await window.api.getAllPrograms();
      this.programs = data.programs || [];
      this.renderPrograms();
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  }

  static renderPrograms() {
    const tbody = document.getElementById('programs-body');
    if (!tbody) return;

    tbody.innerHTML = this.programs.map(p => `
      <tr>
        <td>${this.escapeHtml(p.name)}</td>
        <td><code>${this.escapeHtml(p.code)}</code></td>
        <td>${this.escapeHtml(p.collegeName)}</td>
        <td>${p.durationYears} years</td>
        <td><span class="badge ${p.isActive ? 'bg-success' : 'bg-secondary'}">${p.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" data-action="edit-program" data-id="${p.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-outline-danger" data-action="delete-program" data-id="${p.id}"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="text-center text-muted py-4">No programs</td></tr>';

    tbody.querySelectorAll('[data-action="edit-program"]').forEach(btn => {
      btn.addEventListener('click', () => this.showProgramModal(btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="delete-program"]').forEach(btn => {
      btn.addEventListener('click', () => this.confirmDeleteProgram(btn.dataset.id));
    });
  }

  static showProgramModal(programId = null) {
    const isEdit = !!programId;
    const program = isEdit ? this.programs.find(p => p.id === programId) : null;

    const modalContent = `
      <form id="program-form">
        <input type="hidden" name="id" value="${program?.id || ''}">
        <div class="mb-3">
          <label class="form-label">College <span class="required-indicator">*</span></label>
          <select class="form-select" name="collegeId" required ${isEdit ? 'disabled' : ''}>
            <option value="">Select college...</option>
            ${this.colleges.map(c => `<option value="${c.id}" ${program?.collegeId === c.id ? 'selected' : ''}>${this.escapeHtml(c.name)} (${this.escapeHtml(c.universityName)})</option>`).join('')}
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Name <span class="required-indicator">*</span></label>
          <input type="text" class="form-control" name="name" value="${this.escapeHtml(program?.name || '')}" required maxlength="255">
        </div>
        <div class="mb-3">
          <label class="form-label">Code <span class="required-indicator">*</span></label>
          <input type="text" class="form-control" name="code" value="${this.escapeHtml(program?.code || '')}" required maxlength="50" pattern="[A-Z0-9]+" ${isEdit ? 'readonly' : ''}>
        </div>
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" name="description" rows="3">${this.escapeHtml(program?.description || '')}</textarea>
        </div>
        <div class="mb-3">
          <label class="form-label">Duration (years)</label>
          <input type="number" class="form-control" name="durationYears" value="${program?.durationYears || 3}" min="1" max="10">
        </div>
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="isActive" id="prog-active" ${program?.isActive !== false ? 'checked' : ''}>
          <label class="form-check-label" for="prog-active">Active</label>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'} Program</button>
        </div>
      </form>
    `;

    window.modal.show(modalContent, { title: isEdit ? 'Edit Program' : 'Add Program', size: 'md' });

    document.getElementById('program-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        collegeId: formData.get('collegeId'),
        name: formData.get('name').trim(),
        code: formData.get('code').trim().toUpperCase(),
        description: formData.get('description')?.trim() || undefined,
        durationYears: parseInt(formData.get('durationYears')) || 3,
        isActive: formData.get('isActive') === 'on'
      };

      try {
        if (isEdit) {
          await window.api.updateProgram(programId, data);
          window.toast.success('Program updated');
        } else {
          await window.api.createProgram(data);
          window.toast.success('Program created');
        }
        window.modal.close();
        this.loadPrograms();
      } catch (error) {
        window.toast.error('Failed to save program: ' + error.message);
      }
    });
  }

  static async confirmDeleteProgram(id) {
    const program = this.programs.find(p => p.id === id);
    const confirmed = await window.modal.confirm(
      `Delete "${this.escapeHtml(program?.name)}"? This will also delete all associated courses.`,
      'Delete Program',
      { confirmText: 'Delete', confirmClass: 'btn-danger' }
    );

    if (confirmed) {
      try {
        await window.api.deleteProgram(id);
        window.toast.success('Program deleted');
        this.loadPrograms();
      } catch (error) {
        window.toast.error('Failed to delete: ' + error.message);
      }
    }
  }

  // ============ Courses ============
  static async loadCourses() {
    try {
      const hierarchyData = await window.api.getHierarchy();
      this.courses = [];
      if (hierarchyData.hierarchy) {
        hierarchyData.hierarchy.forEach(uni => {
          uni.colleges?.forEach(college => {
            college.programs?.forEach(program => {
              program.courses?.forEach(course => {
                this.courses.push({
                  ...course,
                  programName: program.name,
                  collegeName: college.name,
                  universityName: uni.name
                });
              });
            });
          });
        });
      }
      this.renderCourses();
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  }

  static renderCourses() {
    const tbody = document.getElementById('courses-body');
    if (!tbody) return;

    tbody.innerHTML = this.courses.map(c => `
      <tr>
        <td>${this.escapeHtml(c.name)}</td>
        <td><code>${this.escapeHtml(c.code)}</code></td>
        <td>${this.escapeHtml(c.programName)}</td>
        <td>Year ${c.year}</td>
        <td>Semester ${c.semester}</td>
        <td>${c.credits}</td>
        <td><span class="badge ${c.isActive ? 'bg-success' : 'bg-secondary'}">${c.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" data-action="edit-course" data-id="${c.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-outline-danger" data-action="delete-course" data-id="${c.id}"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="8" class="text-center text-muted py-4">No courses</td></tr>';

    tbody.querySelectorAll('[data-action="edit-course"]').forEach(btn => {
      btn.addEventListener('click', () => this.showCourseModal(btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="delete-course"]').forEach(btn => {
      btn.addEventListener('click', () => this.confirmDeleteCourse(btn.dataset.id));
    });
  }

  static showCourseModal(courseId = null) {
    const isEdit = !!courseId;
    const course = isEdit ? this.courses.find(c => c.id === courseId) : null;

    const modalContent = `
      <form id="course-form">
        <input type="hidden" name="id" value="${course?.id || ''}">
        <div class="mb-3">
          <label class="form-label">Program <span class="required-indicator">*</span></label>
          <select class="form-select" name="programId" required ${isEdit ? 'disabled' : ''}>
            <option value="">Select program...</option>
            ${this.programs.map(p => `<option value="${p.id}" ${course?.programId === p.id ? 'selected' : ''}>${this.escapeHtml(p.name)} (${this.escapeHtml(p.code)})</option>`).join('')}
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Name <span class="required-indicator">*</span></label>
          <input type="text" class="form-control" name="name" value="${this.escapeHtml(course?.name || '')}" required maxlength="255">
        </div>
        <div class="mb-3">
          <label class="form-label">Code <span class="required-indicator">*</span></label>
          <input type="text" class="form-control" name="code" value="${this.escapeHtml(course?.code || '')}" required maxlength="50" ${isEdit ? 'readonly' : ''}>
        </div>
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" name="description" rows="3">${this.escapeHtml(course?.description || '')}</textarea>
        </div>
        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label">Year <span class="required-indicator">*</span></label>
            <select class="form-select" name="year" required>
              ${[1,2,3,4,5,6,7,8,9,10].map(y => `<option value="${y}" ${course?.year === y ? 'selected' : ''}>Year ${y}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Semester <span class="required-indicator">*</span></label>
            <select class="form-select" name="semester" required>
              <option value="1" ${course?.semester === 1 ? 'selected' : ''}>Semester I</option>
              <option value="2" ${course?.semester === 2 ? 'selected' : ''}>Semester II</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Credits</label>
            <input type="number" class="form-control" name="credits" value="${course?.credits || 3}" min="1" max="10">
          </div>
        </div>
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="isActive" id="course-active" ${course?.isActive !== false ? 'checked' : ''}>
          <label class="form-check-label" for="course-active">Active</label>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'} Course</button>
        </div>
      </form>
    `;

    window.modal.show(modalContent, { title: isEdit ? 'Edit Course' : 'Add Course', size: 'md' });

    document.getElementById('course-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        programId: formData.get('programId'),
        name: formData.get('name').trim(),
        code: formData.get('code').trim(),
        description: formData.get('description')?.trim() || undefined,
        year: parseInt(formData.get('year')),
        semester: parseInt(formData.get('semester')),
        credits: parseInt(formData.get('credits')) || 3,
        isActive: formData.get('isActive') === 'on'
      };

      try {
        if (isEdit) {
          await window.api.updateCourse(courseId, data);
          window.toast.success('Course updated');
        } else {
          await window.api.createCourse(data);
          window.toast.success('Course created');
        }
        window.modal.close();
        this.loadCourses();
      } catch (error) {
        window.toast.error('Failed to save course: ' + error.message);
      }
    });
  }

  static async confirmDeleteCourse(id) {
    const course = this.courses.find(c => c.id === id);
    const confirmed = await window.modal.confirm(
      `Delete "${this.escapeHtml(course?.name)}"?`,
      'Delete Course',
      { confirmText: 'Delete', confirmClass: 'btn-danger' }
    );

    if (confirmed) {
      try {
        await window.api.deleteCourse(id);
        window.toast.success('Course deleted');
        this.loadCourses();
      } catch (error) {
        window.toast.error('Failed to delete: ' + error.message);
      }
    }
  }

  static escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}