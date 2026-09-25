// Main entry point
import { App } from './app.js';
import { Auth } from './auth.js';
import { Router } from './router.js';
import { API } from './api.js';
import { Toast } from './toast.js';
import { Modal } from './modal.js';
import { Storage } from './storage.js';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.auth = new Auth();
  window.router = new Router();
  window.api = new API();
  window.toast = new Toast();
  window.modal = new Modal();
  window.storage = new Storage();
  
  window.app.init();
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  if (window.toast) {
    window.toast.error('An unexpected error occurred. Please try again.');
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  if (window.toast) {
    window.toast.error('An unexpected error occurred. Please try again.');
  }
});