const API_BASE = '/api';

export class API {
  constructor() {
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  getAuthHeaders() {
    const token = window.auth.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const headers = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    // Handle 401 - try to refresh token
    if (response.status === 401 && window.auth.isAuthenticated()) {
      const refreshed = await window.auth.refreshToken();
      if (refreshed) {
        // Retry with new token
        const newHeaders = {
          ...this.defaultHeaders,
          ...this.getAuthHeaders(),
          ...options.headers
        };
        return fetch(`${API_BASE}${endpoint}`, { ...options, headers: newHeaders });
      } else {
        window.auth.logout();
        throw new Error('Session expired. Please log in again.');
      }
    }

    return response;
  }

  async get(endpoint) {
    const response = await this.request(endpoint, { method: 'GET' });
    return this.handleResponse(response);
  }

  async post(endpoint, data) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async put(endpoint, data) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async delete(endpoint) {
    const response = await this.request(endpoint, { method: 'DELETE' });
    return this.handleResponse(response);
  }

  async upload(endpoint, formData) {
    const token = window.auth.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });

    return this.handleResponse(response);
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error = new Error(data?.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  // Academic Structure
  async getHierarchy() {
    return this.get('/academic/hierarchy');
  }

  async getUniversities() {
    return this.get('/academic/universities');
  }

  async getColleges(universityId) {
    return this.get(`/academic/universities/${universityId}/colleges`);
  }

  async getPrograms(collegeId) {
    return this.get(`/academic/colleges/${collegeId}/programs`);
  }

  async getCourses(programId) {
    return this.get(`/academic/programs/${programId}/courses`);
  }

  async getCoursesByYearSemester(programId, year, semester) {
    return this.get(`/academic/programs/${programId}/courses/by-year-semester?year=${year}&semester=${semester}`);
  }

  async getCourse(courseId) {
    return this.get(`/academic/courses/${courseId}`);
  }

  // Materials
  async getMaterials(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return this.get(`/materials?${params.toString()}`);
  }

  async getMaterial(materialId) {
    return this.get(`/materials/${materialId}`);
  }

  async uploadMaterial(formData) {
    return this.upload('/materials', formData);
  }

  async updateMaterial(materialId, data) {
    return this.put(`/materials/${materialId}`, data);
  }

  async deleteMaterial(materialId) {
    return this.delete(`/materials/${materialId}`);
  }

  async downloadMaterial(materialId) {
    const token = window.auth.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(`${API_BASE}/materials/${materialId}/download`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Download failed');
    }

    return response.blob();
  }

  async getUserUploads(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/materials/my-uploads?${params.toString()}`);
  }

  async getMaterialTypes() {
    return this.get('/materials/types');
  }

  // Interactions
  async rateMaterial(materialId, rating, comment) {
    return this.post(`/interactions/materials/${materialId}/rate`, { rating, comment });
  }

  async getRatings(materialId) {
    return this.get(`/interactions/materials/${materialId}/ratings`);
  }

  async deleteRating(materialId, ratingId) {
    return this.delete(`/interactions/materials/${materialId}/ratings/${ratingId}`);
  }

  async reportMaterial(materialId, reason, description) {
    return this.post(`/interactions/materials/${materialId}/report`, { reason, description });
  }

  async toggleBookmark(materialId) {
    return this.post(`/interactions/materials/${materialId}/bookmark`, {});
  }

  async getBookmarks() {
    return this.get('/interactions/bookmarks');
  }

  async getDownloadHistory() {
    return this.get('/interactions/downloads');
  }

  // Admin
  async getAdminStats() {
    return this.get('/admin/dashboard');
  }

  async getAdminUsers(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/admin/users?${params.toString()}`);
  }

  async getAdminUser(userId) {
    return this.get(`/admin/users/${userId}`);
  }

  async updateAdminUser(userId, data) {
    return this.put(`/admin/users/${userId}`, data);
  }

  async suspendUser(userId, isSuspended, reason) {
    return this.put(`/admin/users/${userId}/suspend`, { isSuspended, reason });
  }

  async deleteUser(userId) {
    return this.delete(`/admin/users/${userId}`);
  }

  async getAdminMaterials(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/admin/materials?${params.toString()}`);
  }

  async approveMaterial(materialId, status, rejectionReason) {
    return this.put(`/admin/materials/${materialId}/approve`, { status, rejectionReason });
  }

  async deleteAdminMaterial(materialId) {
    return this.delete(`/admin/materials/${materialId}`);
  }

  async getAdminReports(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/admin/reports?${params.toString()}`);
  }

  async updateReportStatus(reportId, status, resolution) {
    return this.put(`/admin/reports/${reportId}/status`, { status, resolution });
  }

  // Admin Academic
  async createUniversity(data) {
    return this.post('/academic/universities', data);
  }

  async updateUniversity(id, data) {
    return this.put(`/academic/universities/${id}`, data);
  }

  async deleteUniversity(id) {
    return this.delete(`/academic/universities/${id}`);
  }

  async createCollege(data) {
    return this.post('/academic/colleges', data);
  }

  async updateCollege(id, data) {
    return this.put(`/academic/colleges/${id}`, data);
  }

  async deleteCollege(id) {
    return this.delete(`/academic/colleges/${id}`);
  }

  async createProgram(data) {
    return this.post('/academic/programs', data);
  }

  async updateProgram(id, data) {
    return this.put(`/academic/programs/${id}`, data);
  }

  async deleteProgram(id) {
    return this.delete(`/academic/programs/${id}`);
  }

  async createCourse(data) {
    return this.post('/academic/courses', data);
  }

  async updateCourse(id, data) {
    return this.put(`/academic/courses/${id}`, data);
  }

  async deleteCourse(id) {
    return this.delete(`/academic/courses/${id}`);
  }
}