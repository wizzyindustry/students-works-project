export class SettingsPage {
  static template() {
    return `
      <div class="container" style="max-width: 700px;">
        <nav aria-label="Breadcrumb" class="breadcrumb-nav mb-4">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a href="/" data-link>Home</a></li>
            <li class="breadcrumb-item"><a href="/profile" data-link>Profile</a></li>
            <li class="breadcrumb-item active" aria-current="page">Settings</li>
          </ol>
        </nav>

        <h1 class="h3 mb-4">Account Settings</h1>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header">
            <h5 class="mb-0">Profile Information</h5>
          </div>
          <div class="card-body">
            <form id="profile-form" novalidate>
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="firstName" class="form-label">First Name</label>
                  <input type="text" class="form-control" id="firstName" name="firstName" value="${window.auth.getUser()?.fullName?.split(' ')[0] || ''}">
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input type="text" class="form-control" id="lastName" name="lastName" value="${window.auth.getUser()?.fullName?.split(' ').slice(1).join(' ') || ''}">
                </div>
              </div>

              <div class="mb-3">
                <label for="studentNumber" class="form-label">Student Number</label>
                <input type="text" class="form-control" id="studentNumber" name="studentNumber" value="${window.auth.getUser()?.studentNumber || ''}" placeholder="e.g., STU/2024/001">
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="university" class="form-label">University</label>
                  <select class="form-select" id="university" name="universityId">
                    <option value="">Select university...</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="program" class="form-label">Program</label>
                  <select class="form-select" id="program" name="programId" disabled>
                    <option value="">Select university first...</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label for="yearOfStudy" class="form-label">Year of Study</label>
                <select class="form-select" id="yearOfStudy" name="yearOfStudy">
                  <option value="">Select year...</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5</option>
                </select>
              </div>

              <button type="submit" class="btn btn-primary" id="profile-save-btn">
                <i class="bi bi-save me-2"></i> Save Changes
              </button>
            </form>
          </div>
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header">
            <h5 class="mb-0">Change Password</h5>
          </div>
          <div class="card-body">
            <form id="password-form" novalidate>
              <div class="mb-3">
                <label for="currentPassword" class="form-label">Current Password</label>
                <input type="password" class="form-control" id="currentPassword" name="currentPassword" required autocomplete="current-password">
                <div class="form-text text-danger" id="currentPassword-error"></div>
              </div>

              <div class="mb-3">
                <label for="newPassword" class="form-label">New Password</label>
                <input type="password" class="form-control" id="newPassword" name="newPassword" required autocomplete="new-password" minlength="8">
                <div class="form-text text-danger" id="newPassword-error"></div>
              </div>

              <div class="mb-3">
                <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
                <input type="password" class="form-control" id="confirmNewPassword" name="confirmNewPassword" required autocomplete="new-password">
                <div class="form-text text-danger" id="confirmNewPassword-error"></div>
              </div>

              <button type="submit" class="btn btn-primary" id="password-save-btn">
                <i class="bi bi-key me-2"></i> Update Password
              </button>
            </form>
          </div>
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header">
            <h5 class="mb-0">Danger Zone</h5>
          </div>
          <div class="card-body">
            <p class="text-muted">Once you delete your account, there is no going back. Please be certain.</p>
            <button type="button" class="btn btn-danger" id="delete-account-btn">
              <i class="bi bi-trash me-2"></i> Delete Account
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static async init() {
    this.universitiesLoaded = false;
    await this.loadUniversities();
    this.setupEventListeners();
    this.populateCurrentValues();
  }

  static async loadUniversities() {
    if (this.universitiesLoaded) return;
    
    try {
      const data = await window.api.getUniversities();
      if (data.universities) {
        const select = document.getElementById('university');
        select.innerHTML = '<option value="">Select university...</option>' +
          data.universities.map(u => `<option value="${u.id}">${this.escapeHtml(u.name)}</option>`).join('');
        this.universitiesLoaded = true;
      }
    } catch (error) {
      console.error('Failed to load universities:', error);
    }
  }

  static populateCurrentValues() {
    const user = window.auth.getUser();
    if (!user) return;

    document.getElementById('yearOfStudy').value = user.yearOfStudy || '';
    
    if (user.universityId) {
      document.getElementById('university').value = user.universityId;
      this.loadPrograms(user.universityId, user.programId);
    }
  }

  static async loadPrograms(universityId, selectedProgramId = null) {
    const programSelect = document.getElementById('program');
    programSelect.disabled = !universityId;
    programSelect.innerHTML = '<option value="">Loading...</option>';

    if (!universityId) {
      programSelect.innerHTML = '<option value="">Select university first...</option>';
      return;
    }

    try {
      const collegesData = await window.api.getColleges(universityId);
      if (collegesData.colleges && collegesData.colleges.length > 0) {
        let allPrograms = [];
        for (const college of collegesData.colleges) {
          const programsData = await window.api.getPrograms(college.id);
          if (programsData.programs) {
            allPrograms.push(...programsData.programs);
          }
        }
        programSelect.innerHTML = '<option value="">Select program...</option>' +
          allPrograms.map(p => `<option value="${p.id}">${this.escapeHtml(p.name)} (${this.escapeHtml(p.code)})</option>`).join('');
        
        if (selectedProgramId) {
          programSelect.value = selectedProgramId;
        }
      } else {
        programSelect.innerHTML = '<option value="">No programs available</option>';
      }
    } catch (error) {
      console.error('Failed to load programs:', error);
      programSelect.innerHTML = '<option value="">Failed to load programs</option>';
    }
  }

  static setupEventListeners() {
    // University change
    document.getElementById('university').addEventListener('change', async (e) => {
      await this.loadPrograms(e.target.value);
    });

    // Profile form
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        fullName: `${formData.get('firstName').trim()} ${formData.get('lastName').trim()}`.trim(),
        studentNumber: formData.get('studentNumber')?.trim() || undefined,
        universityId: formData.get('universityId') || undefined,
        programId: formData.get('programId') || undefined,
        yearOfStudy: formData.get('yearOfStudy') ? parseInt(formData.get('yearOfStudy')) : undefined
      };

      try {
        await window.auth.updateProfile(data);
        window.toast.success('Profile updated successfully');
      } catch (error) {
        window.toast.error('Failed to update profile: ' + error.message);
      }
    });

    // Password form
    document.getElementById('password-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearPasswordErrors();

      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmNewPassword').value;

      if (!currentPassword) {
        this.showPasswordError('currentPassword', 'Current password is required');
        return;
      }

      if (newPassword.length < 8) {
        this.showPasswordError('newPassword', 'Password must be at least 8 characters');
        return;
      }

      if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        this.showPasswordError('newPassword', 'Password must contain uppercase, lowercase, and number');
        return;
      }

      if (newPassword !== confirmPassword) {
        this.showPasswordError('confirmNewPassword', 'Passwords do not match');
        return;
      }

      try {
        await window.auth.changePassword(currentPassword, newPassword);
        window.toast.success('Password changed successfully');
        document.getElementById('password-form').reset();
      } catch (error) {
        this.showPasswordError('currentPassword', error.message);
      }
    });

    // Delete account
    document.getElementById('delete-account-btn').addEventListener('click', async () => {
      const confirmed = await window.modal.confirm(
        'This will permanently delete your account and all your data. This action cannot be undone. Are you absolutely sure?',
        'Delete Account',
        { confirmText: 'Delete My Account', confirmClass: 'btn-danger' }
      );

      if (confirmed) {
        const doubleConfirmed = await window.modal.confirm(
          'Please confirm one more time: Your account, uploads, bookmarks, and history will be permanently deleted.',
          'Final Confirmation',
          { confirmText: 'Yes, Delete Forever', confirmClass: 'btn-danger' }
        );

        if (doubleConfirmed) {
          try {
            // Note: This would need a backend endpoint
            window.toast.error('Account deletion not implemented yet');
            // await window.api.deleteAccount();
            // window.auth.logout();
          } catch (error) {
            window.toast.error('Failed to delete account');
          }
        }
      }
    });
  }

  static showPasswordError(field, message) {
    const errorEl = document.getElementById(`${field}-error`);
    const inputEl = document.getElementById(field);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add('is-invalid');
  }

  static clearPasswordErrors() {
    document.querySelectorAll('#password-form .form-text.text-danger').forEach(el => el.textContent = '');
    document.querySelectorAll('#password-form .is-invalid').forEach(el => el.classList.remove('is-invalid'));
  }

  static escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}