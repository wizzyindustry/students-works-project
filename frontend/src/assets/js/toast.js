export class Toast {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.idCounter = 0;
  }

  getContainer() {
    if (!this.container) {
      this.container = document.querySelector('.toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  }

  show(message, type = 'info', title = '', duration = 5000) {
    const id = ++this.idCounter;
    const container = this.getContainer();

    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-exclamation-triangle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };

    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="bi ${icons[type]}" aria-hidden="true"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${this.escapeHtml(title || titles[type])}</div>
        <div class="toast-message">${this.escapeHtml(message)}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">
        <i class="bi bi-x-lg"></i>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(id));

    container.appendChild(toast);
    this.toasts.set(id, toast);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  success(message, title = '', duration = 5000) {
    return this.show(message, 'success', title, duration);
  }

  error(message, title = '', duration = 7000) {
    return this.show(message, 'error', title, duration);
  }

  warning(message, title = '', duration = 6000) {
    return this.show(message, 'warning', title, duration);
  }

  info(message, title = '', duration = 5000) {
    return this.show(message, 'info', title, duration);
  }

  remove(id) {
    const toast = this.toasts.get(id);
    if (toast) {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      toast.addEventListener('animationend', () => {
        toast.remove();
      }, { once: true });
      this.toasts.delete(id);
    }
  }

  clear() {
    this.toasts.forEach((_, id) => this.remove(id));
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}