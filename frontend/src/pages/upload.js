export class UploadPage {
  static template() {
    return `
      <div class="container" style="max-width: 800px;">
        <nav aria-label="Breadcrumb" class="breadcrumb-nav mb-4">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a href="/" data-link>Home</a></li>
            <li class="breadcrumb-item"><a href="/search" data-link>Search</a></li>
            <li class="breadcrumb-item active" aria-current="page">Upload Material</li>
          </ol>
        </nav>

        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-1">Upload Material</h1>
            <p class="text-muted mb-0">Share your academic resources with fellow students</p>
          </div>
        </div>

        <form id="upload-form" enctype="multipart/form-data" novalidate>
          <div class="form-section">
            <h5 class="form-section-title">Basic Information</h5>
            
            <div class="mb-3">
              <label for="title" class="form-label">Material Title <span class="required-indicator">*</span></label>
              <input type="text" class="form-control" id="title" name="title" required maxlength="500" placeholder="e.g., Database Systems Midterm Exam 2024">
              <div class="form-text text-danger" id="title-error"></div>
            </div>

            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea class="form-control" id="description" name="description" rows="3" maxlength="5000" placeholder="Brief description of the material..."></textarea>
              <div class="form-text text-danger" id="description-error"></div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label for="course" class="form-label">Course <span class="required-indicator">*</span></label>
                <select class="form-select" id="course" name="courseId" required>
                  <option value="">Select a course...</option>
                </select>
                <div class="form-text text-danger" id="course-error"></div>
              </div>
              <div class="col-md-6">
                <label for="materialType" class="form-label">Material Type</label>
                <select class="form-select" id="materialType" name="materialTypeId">
                  <option value="">Select type...</option>
                </select>
                <div class="form-text text-danger" id="materialType-error"></div>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label for="academicYear" class="form-label">Academic Year</label>
                <input type="text" class="form-control" id="academicYear" name="academicYear" placeholder="2024-2025" maxlength="20">
                <div class="form-text text-danger" id="academicYear-error"></div>
              </div>
              <div class="col-md-6">
                <label for="semester" class="form-label">Semester</label>
                <select class="form-select" id="semester" name="semester">
                  <option value="">Select semester</option>
                  <option value="1">Semester I</option>
                  <option value="2">Semester II</option>
                </select>
                <div class="form-text text-danger" id="semester-error"></div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h5 class="form-section-title">File Upload</h5>
            
            <div class="mb-3">
              <label for="file" class="form-label">Select File <span class="required-indicator">*</span></label>
              <div class="file-upload-area border rounded-3 p-4 text-center" id="file-drop-area">
                <input type="file" class="form-control d-none" id="file" name="file" required accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip">
                <i class="bi bi-cloud-upload display-4 text-muted mb-3"></i>
                <p class="mb-1">Drag & drop a file here, or click to browse</p>
                <p class="text-muted small mb-0">Supported: PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, Images, ZIP (Max 50MB)</p>
              </div>
              <div class="file-preview d-none mt-3" id="file-preview">
                <div class="card">
                  <div class="card-body">
                    <div class="d-flex align-items-center gap-3">
                      <i class="bi bi-file-earmark text-primary" style="font-size: 2rem;"></i>
                      <div class="flex-grow-1">
                        <div class="fw-semibold" id="preview-name"></div>
                        <div class="text-muted small" id="preview-size"></div>
                      </div>
                      <button type="button" class="btn btn-outline-danger btn-sm" id="remove-file" aria-label="Remove file">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-text text-danger" id="file-error"></div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <a href="/my-uploads" class="btn btn-secondary" data-link>Cancel</a>
            <button type="submit" class="btn btn-primary" id="submit-btn">
              <span class="btn-text"><i class="bi bi-upload me-2"></i> Upload Material</span>
              <span class="btn-loading d-none">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>Uploading...
              </span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  static async init() {
    this.editingId = new URLSearchParams(window.location.search).get('edit');
    this.materialTypes = [];
    this.courses = [];

    await Promise.all([
      this.loadMaterialTypes(),
      this.loadCourses()
    ]);

    if (this.editingId) {
      await this.loadMaterialForEdit();
    }

    this.setupEventListeners();
  }

  static async loadMaterialTypes() {
    try {
      const data = await window.api.getMaterialTypes();
      this.materialTypes = data.types || [];
      this.populateTypeSelect();
    } catch (error) {
      console.error('Failed to load material types:', error);
    }
  }

  static populateTypeSelect() {
    const select = document.getElementById('materialType');
    if (select) {
      select.innerHTML = '<option value="">Select type...</option>' +
        this.materialTypes.map(t => `<option value="${t.id}">${this.escapeHtml(t.name)}</option>`).join('');
    }
  }

  static async loadCourses() {
    try {
      // Get all programs and their courses
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
                  programName: program.name,
                  universityName: uni.name
                });
              });
            });
          });
        });
        this.populateCourseSelect();
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  }

  static populateCourseSelect() {
    const select = document.getElementById('course');
    if (select) {
      select.innerHTML = '<option value="">Select a course...</option>' +
        this.courses.map(c => `<option value="${c.id}">${this.escapeHtml(c.name)} (${this.escapeHtml(c.code)}) - ${this.escapeHtml(c.programName)}</option>`).join('');
    }
  }

  static async loadMaterialForEdit() {
    try {
      const data = await window.api.getMaterial(this.editingId);
      const m = data.material;

      if (m.uploaderId !== window.auth.getUser()?.id && !window.auth.isAdmin()) {
        window.toast.error('Not authorized to edit this material');
        window.router.navigate('/my-uploads');
        return;
      }

      document.getElementById('title').value = m.title || '';
      document.getElementById('description').value = m.description || '';
      document.getElementById('course').value = m.courseId || '';
      document.getElementById('materialType').value = m.materialTypeId || '';
      document.getElementById('academicYear').value = m.academicYear || '';
      document.getElementById('semester').value = m.semester || '';

      document.querySelector('h1').textContent = 'Edit Material';
      document.getElementById('submit-btn').querySelector('.btn-text').innerHTML = '<i class="bi bi-pencil me-2"></i> Update Material';
    } catch (error) {
      console.error('Failed to load material for edit:', error);
      window.toast.error('Failed to load material');
      window.router.navigate('/my-uploads');
    }
  }

  static setupEventListeners() {
    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('file');
    const dropArea = document.getElementById('file-drop-area');
    const filePreview = document.getElementById('file-preview');
    const removeFileBtn = document.getElementById('remove-file');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => dropArea.classList.add('border-primary', 'bg-primary-subtle'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => dropArea.classList.remove('border-primary', 'bg-primary-subtle'), false);
    });

    dropArea.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length) {
        fileInput.files = files;
        this.handleFileSelect(files[0]);
      }
    }, false);

    dropArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        this.handleFileSelect(e.target.files[0]);
      }
    });

    removeFileBtn.addEventListener('click', () => {
      fileInput.value = '';
      filePreview.classList.add('d-none');
      dropArea.classList.remove('d-none');
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearErrors();

      const formData = new FormData(form);
      const data = {
        title: formData.get('title')?.trim(),
        description: formData.get('description')?.trim() || undefined,
        courseId: formData.get('courseId') || undefined,
        materialTypeId: formData.get('materialTypeId') || undefined,
        academicYear: formData.get('academicYear')?.trim() || undefined,
        semester: formData.get('semester') ? parseInt(formData.get('semester')) : undefined
      };

      const file = fileInput.files[0];

      if (!this.validateForm(data, file)) return;

      this.setLoading(true);

      try {
        const uploadData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) uploadData.append(key, value);
        });
        uploadData.append('file', file);

        if (this.editingId) {
          await window.api.updateMaterial(this.editingId, data);
          window.toast.success('Material updated successfully');
        } else {
          await window.api.uploadMaterial(uploadData);
          window.toast.success('Material uploaded successfully! It will be available after admin approval.');
        }
        window.router.navigate('/my-uploads');
      } catch (error) {
        this.showError('general', error.message);
      } finally {
        this.setLoading(false);
      }
    });

    // Clear errors on input
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => this.clearError(input.name));
      input.addEventListener('change', () => this.clearError(input.name));
    });
  }

  static handleFileSelect(file) {
    const dropArea = document.getElementById('file-drop-area');
    const filePreview = document.getElementById('file-preview');
    const previewName = document.getElementById('preview-name');
    const previewSize = document.getElementById('preview-size');
    const fileError = document.getElementById('file-error');

    // Validate file
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/zip'
    ];

    if (file.size > maxSize) {
      fileError.textContent = 'File size exceeds 50MB limit';
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      fileError.textContent = 'File type not allowed';
      return;
    }

    fileError.textContent = '';
    previewName.textContent = file.name;
    previewSize.textContent = this.formatFileSize(file.size);
    
    dropArea.classList.add('d-none');
    filePreview.classList.remove('d-none');
  }

  static validateForm(data, file) {
    let isValid = true;

    if (!data.title || data.title.length < 3) {
      this.showError('title', 'Title must be at least 3 characters');
      isValid = false;
    } else if (data.title.length > 500) {
      this.showError('title', 'Title must not exceed 500 characters');
      isValid = false;
    }

    if (data.description && data.description.length > 5000) {
      this.showError('description', 'Description must not exceed 5000 characters');
      isValid = false;
    }

    if (!data.courseId) {
      this.showError('course', 'Please select a course');
      isValid = false;
    }

    if (data.academicYear && !/^\d{4}(-\d{4})?$/.test(data.academicYear)) {
      this.showError('academicYear', 'Format: YYYY or YYYY-YYYY');
      isValid = false;
    }

    if (!file && !this.editingId) {
      this.showError('file', 'Please select a file to upload');
      isValid = false;
    }

    return isValid;
  }

  static showError(field, message) {
    const errorEl = document.getElementById(`${field}-error`);
    const inputEl = document.getElementById(field);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add('is-invalid');
  }

  static clearError(field) {
    const errorEl = document.getElementById(`${field}-error`);
    const inputEl = document.getElementById(field);
    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.classList.remove('is-invalid');
  }

  static clearErrors() {
    document.querySelectorAll('.form-text.text-danger').forEach(el => el.textContent = '');
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  }

  static setLoading(loading) {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    submitBtn.disabled = loading;
    btnText.classList.toggle('d-none', loading);
    btnLoading.classList.toggle('d-none', !loading);
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}