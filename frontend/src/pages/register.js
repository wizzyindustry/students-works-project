export class RegisterPage {
  static template() {
    return `
      <div class="container" style="max-width: 520px;">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 p-md-5">
            <div class="text-center mb-4">
              <a href="/" class="logo d-inline-flex mb-3" data-link>
                <i class="bi bi-book-half"></i>
                <span>Student Materials</span>
              </a>
              <h2 class="h4 fw-bold">Create your account</h2>
              <p class="text-muted">Join thousands of students sharing academic resources</p>
            </div>

            <form id="register-form" novalidate>
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="firstName" class="form-label">First Name <span class="required-indicator">*</span></label>
                  <input type="text" class="form-control" id="firstName" name="firstName" required autocomplete="given-name">
                  <div class="form-text text-danger" id="firstName-error"></div>
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-label">Last Name <span class="required-indicator">*</span></label>
                  <input type="text" class="form-control" id="lastName" name="lastName" required autocomplete="family-name">
                  <div class="form-text text-danger" id="lastName-error"></div>
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email Address <span class="required-indicator">*</span></label>
                <input type="email" class="form-control" id="email" name="email" required autocomplete="email" placeholder="student@university.edu">
                <div class="form-text text-danger" id="email-error"></div>
              </div>

              <div class="mb-3">
                <label for="studentNumber" class="form-label">Student Number (Optional)</label>
                <input type="text" class="form-control" id="studentNumber" name="studentNumber" autocomplete="off" placeholder="e.g., STU/2024/001">
                <div class="form-text text-danger" id="studentNumber-error"></div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="university" class="form-label">University <span class="required-indicator">*</span></label>
                  <select class="form-select" id="university" name="universityId" required>
                    <option value="">Select university...</option>
                  </select>
                  <div class="form-text text-danger" id="university-error"></div>
                </div>
                <div class="col-md-6">
                  <label for="program" class="form-label">Program <span class="required-indicator">*</span></label>
                  <select class="form-select" id="program" name="programId" required disabled>
                    <option value="">Select university first...</option>
                  </select>
                  <div class="form-text text-danger" id="program-error"></div>
                </div>
              </div>

              <div class="mb-3">
                <label for="yearOfStudy" class="form-label">Year of Study <span class="required-indicator">*</span></label>
                <select class="form-select" id="yearOfStudy" name="yearOfStudy" required>
                  <option value="">Select year...</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5</option>
                </select>
                <div class="form-text text-danger" id="yearOfStudy-error"></div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password <span class="required-indicator">*</span></label>
                <div class="input-group">
                  <input type="password" class="form-control" id="password" name="password" required autocomplete="new-password" placeholder="At least 8 characters">
                  <button type="button" class="btn btn-outline-secondary" id="toggle-password" aria-label="Toggle password visibility">
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
                <div class="password-strength mt-2" id="password-strength" style="display: none;">
                  <div class="progress" style="height: 4px;">
                    <div class="progress-bar" id="password-strength-bar" role="progressbar" style="width: 0%"></div>
                  </div>
                  <small class="text-muted" id="password-strength-text"></small>
                </div>
                <div class="form-text text-danger" id="password-error"></div>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password <span class="required-indicator">*</span></label>
                <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" required autocomplete="new-password" placeholder="Confirm your password">
                <div class="form-text text-danger" id="confirmPassword-error"></div>
              </div>

              <div class="mb-4">
                <div class="form-check">
                  <input type="checkbox" class="form-check-input" id="terms" name="terms" required>
                  <label class="form-check-label small" for="terms">
                    I agree to the <a href="/terms" data-link>Terms of Service</a> and <a href="/privacy" data-link>Privacy Policy</a>
                  </label>
                </div>
                <div class="form-text text-danger" id="terms-error"></div>
              </div>

              <button type="submit" class="btn btn-primary w-100 mb-3" id="register-btn">
                <span class="btn-text">Create Account</span>
                <span class="btn-loading d-none">
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>Creating account...
                </span>
              </button>
            </form>

            <div class="text-center">
              <p class="text-muted mb-0">Already have an account? <a href="/login" class="fw-medium" data-link>Sign in</a></p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static async init() {
    const form = document.getElementById('register-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const toggleBtn = document.getElementById('toggle-password');
    const registerBtn = document.getElementById('register-btn');
    const btnText = registerBtn.querySelector('.btn-text');
    const btnLoading = registerBtn.querySelector('.btn-loading');
    const universitySelect = document.getElementById('university');
    const programSelect = document.getElementById('program');

    // Load universities
    await this.loadUniversities();

    // Toggle password visibility
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      toggleBtn.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    });

    // Password strength meter
    passwordInput.addEventListener('input', () => this.updatePasswordStrength(passwordInput.value));

    // University change -> load programs
    universitySelect.addEventListener('change', async () => {
      programSelect.disabled = !universitySelect.value;
      programSelect.innerHTML = '<option value="">Loading...</option>';
      
      if (universitySelect.value) {
        await this.loadPrograms(universitySelect.value);
      } else {
        programSelect.innerHTML = '<option value="">Select university first...</option>';
      }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearErrors();

      const formData = new FormData(form);
      const data = {
        fullName: `${formData.get('firstName').trim()} ${formData.get('lastName').trim()}`.trim(),
        email: formData.get('email').trim().toLowerCase(),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        studentNumber: formData.get('studentNumber')?.trim() || undefined,
        universityId: formData.get('universityId') || undefined,
        programId: formData.get('programId') || undefined,
        yearOfStudy: parseInt(formData.get('yearOfStudy')) || undefined
      };

      if (!this.validateForm(data)) return;

      this.setLoading(true);

      try {
        await window.auth.register(data);
        window.toast.success('Account created successfully!');
        window.router.navigate('/browse');
      } catch (error) {
        this.showError('general', error.message);
      } finally {
        this.setLoading(false);
      }
    });

    // Clear errors on input
    form.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', () => this.clearError(input.name));
      input.addEventListener('change', () => this.clearError(input.name));
    });
  }

  static async loadUniversities() {
    const select = document.getElementById('university');
    try {
      const data = await window.api.getUniversities();
      if (data.universities) {
        select.innerHTML = '<option value="">Select university...</option>' +
          data.universities.map(u => `<option value="${u.id}">${this.escapeHtml(u.name)}</option>`).join('');
      }
    } catch (error) {
      console.error('Failed to load universities:', error);
      select.innerHTML = '<option value="">Failed to load universities</option>';
    }
  }

  static async loadPrograms(universityId) {
    const select = document.getElementById('program');
    try {
      // Get colleges first, then programs
      const collegesData = await window.api.getColleges(universityId);
      if (collegesData.colleges && collegesData.colleges.length > 0) {
        let allPrograms = [];
        for (const college of collegesData.colleges) {
          const programsData = await window.api.getPrograms(college.id);
          if (programsData.programs) {
            allPrograms.push(...programsData.programs.map(p => ({
              ...p,
              collegeName: college.name
            })));
          }
        }
        select.innerHTML = '<option value="">Select program...</option>' +
          allPrograms.map(p => `<option value="${p.id}">${this.escapeHtml(p.name)} (${this.escapeHtml(p.code)})</option>`).join('');
      } else {
        select.innerHTML = '<option value="">No programs available</option>';
      }
    } catch (error) {
      console.error('Failed to load programs:', error);
      select.innerHTML = '<option value="">Failed to load programs</option>';
    }
  }

  static updatePasswordStrength(password) {
    const strengthEl = document.getElementById('password-strength');
    const barEl = document.getElementById('password-strength-bar');
    const textEl = document.getElementById('password-strength-text');

    if (!password) {
      strengthEl.style.display = 'none';
      return;
    }

    strengthEl.style.display = 'block';

    let score = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];

    score = checks.filter(Boolean).length;

    const levels = [
      { label: 'Very Weak', class: 'bg-danger', width: '20%' },
      { label: 'Weak', class: 'bg-danger', width: '40%' },
      { label: 'Fair', class: 'bg-warning', width: '60%' },
      { label: 'Good', class: 'bg-info', width: '80%' },
      { label: 'Strong', class: 'bg-success', width: '100%' }
    ];

    const level = levels[Math.min(score, 4)];
    barEl.className = `progress-bar ${level.class}`;
    barEl.style.width = level.width;
    textEl.textContent = `Password strength: ${level.label}`;
  }

  static validateForm(data) {
    let isValid = true;

    if (!data.fullName || data.fullName.trim().length < 2) {
      this.showError('firstName', 'Full name must be at least 2 characters');
      isValid = false;
    }

    if (!this.isValidEmail(data.email)) {
      this.showError('email', 'Please enter a valid email address');
      isValid = false;
    }

    if (data.studentNumber && data.studentNumber.length > 100) {
      this.showError('studentNumber', 'Student number is too long');
      isValid = false;
    }

    if (!data.universityId) {
      this.showError('university', 'Please select a university');
      isValid = false;
    }

    if (!data.programId) {
      this.showError('program', 'Please select a program');
      isValid = false;
    }

    if (!data.yearOfStudy || data.yearOfStudy < 1 || data.yearOfStudy > 10) {
      this.showError('yearOfStudy', 'Please select a valid year');
      isValid = false;
    }

    const password = data.password;
    if (!password || password.length < 8) {
      this.showError('password', 'Password must be at least 8 characters');
      isValid = false;
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      this.showError('password', 'Password must contain uppercase, lowercase, and number');
      isValid = false;
    }

    if (data.password !== data.confirmPassword) {
      this.showError('confirmPassword', 'Passwords do not match');
      isValid = false;
    }

    const terms = document.getElementById('terms');
    if (!terms.checked) {
      this.showError('terms', 'You must accept the terms and conditions');
      isValid = false;
    }

    return isValid;
  }

  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    const registerBtn = document.getElementById('register-btn');
    const btnText = registerBtn.querySelector('.btn-text');
    const btnLoading = registerBtn.querySelector('.btn-loading');
    
    registerBtn.disabled = loading;
    btnText.classList.toggle('d-none', loading);
    btnLoading.classList.toggle('d-none', !loading);
  }

  static escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}