export class LoginPage {
  static template() {
    return `
      <div class="container" style="max-width: 440px;">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 p-md-5">
            <div class="text-center mb-4">
              <a href="/" class="logo d-inline-flex mb-3" data-link>
                <i class="bi bi-book-half"></i>
                <span>Student Materials</span>
              </a>
              <h2 class="h4 fw-bold">Welcome back</h2>
              <p class="text-muted">Sign in to access your academic materials</p>
            </div>

            <form id="login-form" novalidate>
              <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input type="email" class="form-control" id="email" name="email" required autocomplete="email" placeholder="student@university.edu">
                <div class="form-text text-danger" id="email-error"></div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="input-group">
                  <input type="password" class="form-control" id="password" name="password" required autocomplete="current-password" placeholder="Enter your password">
                  <button type="button" class="btn btn-outline-secondary" id="toggle-password" aria-label="Toggle password visibility">
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
                <div class="form-text text-danger" id="password-error"></div>
              </div>

              <div class="mb-3 d-flex justify-content-between align-items-center">
                <div class="form-check">
                  <input type="checkbox" class="form-check-input" id="remember" name="remember">
                  <label class="form-check-label small" for="remember">Remember me</label>
                </div>
                <a href="/forgot-password" class="small" data-link>Forgot password?</a>
              </div>

              <button type="submit" class="btn btn-primary w-100 mb-3" id="login-btn">
                <span class="btn-text">Sign In</span>
                <span class="btn-loading d-none">
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>Signing in...
                </span>
              </button>
            </form>

            <div class="text-center">
              <p class="text-muted mb-0">Don't have an account? <a href="/register" class="fw-medium" data-link>Sign up</a></p>
            </div>

            <hr class="my-4">
            
            <div class="text-center">
              <p class="text-muted small mb-2">Demo Accounts</p>
              <div class="d-grid gap-2">
                <button type="button" class="btn btn-outline-secondary btn-sm" data-demo="student">
                  Student: student@udom.ac.tz / student123
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm" data-demo="admin">
                  Admin: admin@udom.ac.tz / admin123
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static async init() {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-password');
    const loginBtn = document.getElementById('login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');

    // Toggle password visibility
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      toggleBtn.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    });

    // Demo account buttons
    document.querySelectorAll('[data-demo]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.demo;
        if (type === 'student') {
          emailInput.value = 'student@udom.ac.tz';
          passwordInput.value = 'student123';
        } else if (type === 'admin') {
          emailInput.value = 'admin@udom.ac.tz';
          passwordInput.value = 'admin123';
        }
      });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearErrors();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!this.validateForm(email, password)) return;

      this.setLoading(true);

      try {
        await window.auth.login(email, password);
        window.toast.success('Welcome back!');
        
        // Redirect to intended page or home
        const redirect = new URLSearchParams(window.location.search).get('redirect') || '/browse';
        window.router.navigate(redirect);
      } catch (error) {
        this.showError('general', error.message);
      } finally {
        this.setLoading(false);
      }
    });

    // Clear errors on input
    [emailInput, passwordInput].forEach(input => {
      input.addEventListener('input', () => this.clearError(input.name));
    });
  }

  static validateForm(email, password) {
    let isValid = true;

    if (!email) {
      this.showError('email', 'Email is required');
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      this.showError('email', 'Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      this.showError('password', 'Password is required');
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
    const loginBtn = document.getElementById('login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');
    
    loginBtn.disabled = loading;
    btnText.classList.toggle('d-none', loading);
    btnLoading.classList.toggle('d-none', !loading);
  }
}