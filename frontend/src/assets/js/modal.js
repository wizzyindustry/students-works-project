export class Modal {
  constructor() {
    this.currentModal = null;
    this.onCloseCallbacks = new Set();
  }

  show(content, options = {}) {
    this.close();

    const {
      title = '',
      size = '', // '', 'sm', 'lg', 'xl'
      centered = false,
      backdrop = true,
      keyboard = true,
      onClose = null
    } = options;

    const modalId = `modal-${Date.now()}`;
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = modalId;
    modal.tabIndex = -1;
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('role', 'dialog');
    modal.innerHTML = `
      <div class="modal-dialog ${size ? `modal-${size}` : ''} ${centered ? 'modal-dialog-centered' : ''}">
        <div class="modal-content">
          ${title ? `
            <div class="modal-header">
              <h5 class="modal-title">${this.escapeHtml(title)}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
          ` : ''}
          <div class="modal-body">${content}</div>
        </div>
      </div>
    `;

    if (backdrop === 'static') {
      modal.setAttribute('data-bs-backdrop', 'static');
    }

    if (!keyboard) {
      modal.setAttribute('data-bs-keyboard', 'false');
    }

    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    // Create backdrop
    const backdropEl = document.createElement('div');
    backdropEl.className = 'modal-backdrop fade show';
    document.body.appendChild(backdropEl);

    // Show modal
    requestAnimationFrame(() => {
      modal.classList.add('show');
      modal.style.display = 'block';
    });

    // Focus management
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
      if (e.key === 'Escape' && keyboard) {
        this.close();
      }
    };

    modal.addEventListener('keydown', handleKeyDown);

    // Close handlers
    const closeModal = () => this.close();
    
    modal.querySelectorAll('[data-bs-dismiss="modal"], .btn-close').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    if (backdrop !== 'static') {
      backdropEl.addEventListener('click', closeModal);
    }

    this.currentModal = {
      element: modal,
      backdrop: backdropEl,
      handleKeyDown,
      onClose
    };

    if (onClose) {
      this.onCloseCallbacks.add(onClose);
    }

    firstFocusable?.focus();

    return modal;
  }

  close() {
    if (!this.currentModal) return;

    const { element, backdrop, handleKeyDown, onClose } = this.currentModal;

    element.classList.remove('show');
    backdrop.classList.remove('show');

    const cleanup = () => {
      element.removeEventListener('keydown', handleKeyDown);
      element.remove();
      backdrop.remove();
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      this.currentModal = null;
      if (onClose) this.onCloseCallbacks.delete(onClose);
    };

    // Wait for transition
    setTimeout(cleanup, 150);
  }

  confirm(message, title = 'Confirm', options = {}) {
    return new Promise((resolve) => {
      const content = `
        <div class="text-center py-2">
          <p class="mb-4">${this.escapeHtml(message)}</p>
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-secondary" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="confirm">${options.confirmText || 'Confirm'}</button>
          </div>
        </div>
      `;

      this.show(content, { title, size: 'sm', ...options });

      const handleAction = (e) => {
        const action = e.target.dataset.action;
        if (action === 'confirm') {
          this.close();
          resolve(true);
        } else if (action === 'cancel') {
          this.close();
          resolve(false);
        }
      };

      this.currentModal.element.addEventListener('click', handleAction);
    });
  }

  alert(message, title = 'Alert') {
    return new Promise((resolve) => {
      const content = `
        <div class="text-center py-2">
          <p class="mb-4">${this.escapeHtml(message)}</p>
          <button class="btn btn-primary" data-action="ok">OK</button>
        </div>
      `;

      this.show(content, { title, size: 'sm' });

      const handleAction = (e) => {
        if (e.target.dataset.action === 'ok') {
          this.close();
          resolve(true);
        }
      };

      this.currentModal.element.addEventListener('click', handleAction);
    });
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}