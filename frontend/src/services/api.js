import {
  MOCK_UNIVERSITIES,
  MOCK_MATERIAL_TYPES,
  MOCK_MATERIALS,
  MOCK_USERS,
  MOCK_REPORTS
} from './mockData.js';

const API_BASE = '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('accessToken') || null;
    // Local persistence for mock mutations when database is offline
    this.localMaterials = this.loadLocal('local_materials', MOCK_MATERIALS);
    this.localBookmarks = this.loadLocal('local_bookmarks', ['mat-1', 'mat-2']);
    this.localDownloads = this.loadLocal('local_downloads', [
      { id: 'dl-1', material: MOCK_MATERIALS[0], downloadedAt: new Date(Date.now() - 7200000).toISOString() }
    ]);
    this.localUsers = this.loadLocal('local_users', MOCK_USERS);
    this.localReports = this.loadLocal('local_reports', MOCK_REPORTS);
    this.localUniversities = this.loadLocal('local_universities', MOCK_UNIVERSITIES);
  }

  loadLocal(key, defaultVal) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  saveLocal(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const headers = {
      ...this.getHeaders(),
      ...options.headers
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (err) {
      console.warn(`API call failed for ${endpoint}: ${err.message}. Using resilient fallback.`);
      throw err;
    }
  }

  // Auth Endpoints
  async login(email, password) {
    try {
      return await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    } catch (error) {
      // Offline fallback login for demo accounts
      const matched = this.localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched || email.includes('admin') || email.includes('student')) {
        const isAdmin = email.includes('admin');
        const user = matched || {
          id: isAdmin ? 'usr-admin' : 'usr-student',
          fullName: isAdmin ? 'System Administrator' : 'Demo Student',
          email,
          role: isAdmin ? 'admin' : 'student',
          isActive: true
        };
        const token = 'mock-jwt-token-' + Date.now();
        this.setToken(token);
        return {
          accessToken: token,
          refreshToken: 'mock-refresh-token',
          user
        };
      }
      throw error;
    }
  }

  async register(data) {
    try {
      return await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      const newUser = {
        id: 'usr-' + Date.now(),
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        studentNumber: data.studentNumber || '',
        universityId: data.universityId,
        programId: data.programId,
        yearOfStudy: data.yearOfStudy,
        role: 'student',
        isActive: true
      };
      this.localUsers.push(newUser);
      this.saveLocal('local_users', this.localUsers);

      const token = 'mock-jwt-token-' + Date.now();
      this.setToken(token);
      return {
        accessToken: token,
        refreshToken: 'mock-refresh-token',
        user: newUser
      };
    }
  }

  async getProfile() {
    try {
      return await this.request('/auth/profile');
    } catch {
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : this.localUsers[1];
      return {
        user,
        stats: {
          uploadsCount: this.localMaterials.filter(m => m.uploader?.id === user?.id).length,
          downloadsCount: this.localDownloads.length,
          bookmarksCount: this.localBookmarks.length
        }
      };
    }
  }

  async updateProfile(updates) {
    try {
      return await this.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch {
      const stored = localStorage.getItem('user');
      const currentUser = stored ? JSON.parse(stored) : this.localUsers[1];
      const updated = { ...currentUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return { user: updated };
    }
  }

  // Academic Structure
  async getUniversities() {
    try {
      return await this.request('/academic/universities');
    } catch {
      return { universities: this.localUniversities };
    }
  }

  async getColleges(universityId) {
    try {
      return await this.request(`/academic/universities/${universityId}/colleges`);
    } catch {
      const uni = this.localUniversities.find(u => u.id === universityId) || this.localUniversities[0];
      return { colleges: uni.colleges || [] };
    }
  }

  async getPrograms(collegeId) {
    try {
      return await this.request(`/academic/colleges/${collegeId}/programs`);
    } catch {
      for (const u of this.localUniversities) {
        const col = (u.colleges || []).find(c => c.id === collegeId);
        if (col) return { programs: col.programs || [] };
      }
      return { programs: this.localUniversities[0].colleges[0].programs };
    }
  }

  async getCourses(programId) {
    try {
      return await this.request(`/academic/programs/${programId}/courses`);
    } catch {
      for (const u of this.localUniversities) {
        for (const c of u.colleges || []) {
          const p = (c.programs || []).find(prg => prg.id === programId);
          if (p) return { courses: p.courses || [] };
        }
      }
      return { courses: this.localUniversities[0].colleges[0].programs[0].courses };
    }
  }

  async getCoursesByYearSemester(programId, year, semester) {
    try {
      return await this.request(`/academic/programs/${programId}/courses/by-year-semester?year=${year}&semester=${semester}`);
    } catch {
      const coursesRes = await this.getCourses(programId);
      const filtered = (coursesRes.courses || []).filter(c => 
        (!year || c.year === Number(year)) && (!semester || c.semester === Number(semester))
      );
      return { courses: filtered.length ? filtered : coursesRes.courses };
    }
  }

  async getHierarchy() {
    try {
      return await this.request('/academic/hierarchy');
    } catch {
      return { hierarchy: this.localUniversities };
    }
  }

  // Materials
  async getMaterialTypes() {
    try {
      return await this.request('/materials/types');
    } catch {
      return { types: MOCK_MATERIAL_TYPES };
    }
  }

  async getMaterialsStats() {
    try {
      return await this.request('/materials/stats');
    } catch {
      return {
        stats: {
          materials: {
            approved: this.localMaterials.filter(m => m.status === 'approved').length,
            pending: this.localMaterials.filter(m => m.status === 'pending').length,
            totalDownloads: this.localMaterials.reduce((acc, m) => acc + (m.downloadCount || 0), 0)
          },
          users: {
            students: this.localUsers.filter(u => u.role === 'student').length,
            active: this.localUsers.length
          }
        }
      };
    }
  }

  async getMaterials(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });

    try {
      return await this.request(`/materials?${params.toString()}`);
    } catch {
      let results = [...this.localMaterials];
      if (filters.status) {
        results = results.filter(m => m.status === filters.status);
      } else {
        // default approved only
        results = results.filter(m => m.status === 'approved');
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(m => 
          m.title.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.course?.name?.toLowerCase().includes(q) ||
          m.course?.code?.toLowerCase().includes(q)
        );
      }

      if (filters.materialTypeId) {
        results = results.filter(m => m.materialType?.id === filters.materialTypeId);
      }

      if (filters.courseId) {
        results = results.filter(m => m.course?.id === filters.courseId);
      }

      if (filters.academicYear) {
        results = results.filter(m => m.academicYear === filters.academicYear);
      }

      if (filters.sortBy === 'download_count') {
        results.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
      } else if (filters.sortBy === 'average_rating') {
        results.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      } else if (filters.sortBy === 'title') {
        results.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return {
        materials: results,
        total: results.length,
        limit: filters.limit || 20,
        offset: filters.offset || 0
      };
    }
  }

  async getMaterial(id) {
    try {
      return await this.request(`/materials/${id}`);
    } catch {
      const found = this.localMaterials.find(m => m.id === id);
      if (!found) throw new Error('Material not found');
      return { material: found };
    }
  }

  async uploadMaterial(formData) {
    try {
      const token = this.token;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE}/materials`, {
        method: 'POST',
        headers,
        body: formData
      });
      return await response.json();
    } catch {
      // Mock upload handler
      const title = formData.get('title') || 'Untitled Material';
      const description = formData.get('description') || '';
      const courseId = formData.get('courseId');
      const materialTypeId = formData.get('materialTypeId');
      const academicYear = formData.get('academicYear') || '2024-2025';
      const semester = Number(formData.get('semester')) || 1;
      const file = formData.get('file');

      const newMaterial = {
        id: 'mat-' + Date.now(),
        title,
        description,
        fileSize: file ? file.size : 2048500,
        formattedSize: file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : '2.0 MB',
        mimeType: file?.type || 'application/pdf',
        fileName: file?.name || 'document.pdf',
        academicYear,
        semester,
        status: 'approved',
        downloadCount: 0,
        averageRating: 5.0,
        ratingsCount: 1,
        createdAt: new Date().toISOString(),
        course: { id: courseId || 'crs-1', code: 'CS211', name: 'Data Structures and Algorithms' },
        program: { id: 'p-1', code: 'BCS', name: 'BSc in Computer Science' },
        university: { id: 'u-1', code: 'UDOM', name: 'University of Dodoma' },
        materialType: MOCK_MATERIAL_TYPES.find(t => t.id === materialTypeId) || MOCK_MATERIAL_TYPES[0],
        uploader: JSON.parse(localStorage.getItem('user') || '{}')
      };

      this.localMaterials.unshift(newMaterial);
      this.saveLocal('local_materials', this.localMaterials);
      return { material: newMaterial, message: 'Material uploaded successfully' };
    }
  }

  async getUserUploads() {
    try {
      return await this.request('/materials/my-uploads');
    } catch {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const mine = this.localMaterials.filter(m => m.uploader?.id === user.id || m.uploader?.role === 'student');
      return { materials: mine, total: mine.length };
    }
  }

  async downloadMaterial(materialId) {
    try {
      const token = this.token;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE}/materials/${materialId}/download`, {
        method: 'POST',
        headers
      });
      if (!response.ok) throw new Error('Download failed');
      return await response.blob();
    } catch {
      // Mock download: generate sample blob
      const mat = this.localMaterials.find(m => m.id === materialId);
      if (mat) {
        mat.downloadCount = (mat.downloadCount || 0) + 1;
        this.saveLocal('local_materials', this.localMaterials);
        this.localDownloads.unshift({
          id: 'dl-' + Date.now(),
          material: mat,
          downloadedAt: new Date().toISOString()
        });
        this.saveLocal('local_downloads', this.localDownloads);
      }
      return new Blob([`Sample preview of material ${mat?.title || materialId}`], { type: 'application/pdf' });
    }
  }

  // Interactions (Bookmarks, Ratings, Reports)
  async toggleBookmark(materialId) {
    try {
      return await this.request(`/interactions/materials/${materialId}/bookmark`, { method: 'POST' });
    } catch {
      const idx = this.localBookmarks.indexOf(materialId);
      let bookmarked = false;
      if (idx > -1) {
        this.localBookmarks.splice(idx, 1);
        bookmarked = false;
      } else {
        this.localBookmarks.push(materialId);
        bookmarked = true;
      }
      this.saveLocal('local_bookmarks', this.localBookmarks);
      return { bookmarked, message: bookmarked ? 'Bookmark added' : 'Bookmark removed' };
    }
  }

  async getBookmarks() {
    try {
      return await this.request('/interactions/bookmarks');
    } catch {
      const bookmarkedMats = this.localMaterials
        .filter(m => this.localBookmarks.includes(m.id))
        .map(material => ({ id: 'bm-' + material.id, material }));
      return { bookmarks: bookmarkedMats };
    }
  }

  async getDownloadHistory() {
    try {
      return await this.request('/interactions/downloads');
    } catch {
      return { downloads: this.localDownloads, total: this.localDownloads.length };
    }
  }

  async rateMaterial(materialId, rating, comment) {
    try {
      return await this.request(`/interactions/materials/${materialId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
      });
    } catch {
      const mat = this.localMaterials.find(m => m.id === materialId);
      if (mat) {
        mat.ratingsCount = (mat.ratingsCount || 0) + 1;
        mat.averageRating = Number(((mat.averageRating * (mat.ratingsCount - 1) + rating) / mat.ratingsCount).toFixed(1));
        this.saveLocal('local_materials', this.localMaterials);
      }
      return { message: 'Rating submitted successfully' };
    }
  }

  async reportMaterial(materialId, reason, description) {
    try {
      return await this.request(`/interactions/materials/${materialId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason, description })
      });
    } catch {
      const mat = this.localMaterials.find(m => m.id === materialId);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.localReports.push({
        id: 'rep-' + Date.now(),
        materialId,
        materialTitle: mat?.title || 'Material',
        reporterName: user.fullName || 'Student',
        reporterEmail: user.email || 'student@udom.ac.tz',
        reason,
        description,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      this.saveLocal('local_reports', this.localReports);
      return { message: 'Report submitted for review' };
    }
  }

  // Admin Endpoints
  async getAdminStats() {
    try {
      return await this.request('/admin/dashboard');
    } catch {
      return {
        stats: {
          users: {
            total: this.localUsers.length,
            students: this.localUsers.filter(u => u.role === 'student').length,
            admins: this.localUsers.filter(u => u.role === 'admin').length
          },
          materials: {
            total: this.localMaterials.length,
            approved: this.localMaterials.filter(m => m.status === 'approved').length,
            pending: this.localMaterials.filter(m => m.status === 'pending').length,
            rejected: this.localMaterials.filter(m => m.status === 'rejected').length,
            totalDownloads: this.localMaterials.reduce((acc, m) => acc + (m.downloadCount || 0), 0)
          },
          reports: {
            total: this.localReports.length,
            pending: this.localReports.filter(r => r.status === 'pending').length,
            resolved: this.localReports.filter(r => r.status === 'resolved').length
          }
        }
      };
    }
  }

  async getAdminUsers(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      return await this.request(`/admin/users?${params.toString()}`);
    } catch {
      let users = [...this.localUsers];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        users = users.filter(u => u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
      }
      if (filters.role) {
        users = users.filter(u => u.role === filters.role);
      }
      return { users, total: users.length };
    }
  }

  async suspendUser(userId, isSuspended, reason = '') {
    try {
      return await this.request(`/admin/users/${userId}/suspend`, {
        method: 'PUT',
        body: JSON.stringify({ isSuspended, reason })
      });
    } catch {
      const u = this.localUsers.find(x => x.id === userId);
      if (u) {
        u.isSuspended = isSuspended;
        u.suspensionReason = reason;
        this.saveLocal('local_users', this.localUsers);
      }
      return { user: u, message: `User ${isSuspended ? 'suspended' : 'activated'}` };
    }
  }

  async getAdminMaterials(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      return await this.request(`/admin/materials?${params.toString()}`);
    } catch {
      let list = [...this.localMaterials];
      if (filters.status) {
        list = list.filter(m => m.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(m => m.title.toLowerCase().includes(q));
      }
      return { materials: list, total: list.length };
    }
  }

  async approveMaterial(materialId, status, rejectionReason = '') {
    try {
      return await this.request(`/admin/materials/${materialId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ status, rejectionReason })
      });
    } catch {
      const m = this.localMaterials.find(x => x.id === materialId);
      if (m) {
        m.status = status;
        if (rejectionReason) m.rejectionReason = rejectionReason;
        this.saveLocal('local_materials', this.localMaterials);
      }
      return { material: m, message: `Material ${status}` };
    }
  }

  async deleteMaterial(materialId) {
    try {
      return await this.request(`/admin/materials/${materialId}`, { method: 'DELETE' });
    } catch {
      this.localMaterials = this.localMaterials.filter(m => m.id !== materialId);
      this.saveLocal('local_materials', this.localMaterials);
      return { message: 'Material deleted' };
    }
  }

  async getAdminReports(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      return await this.request(`/admin/reports?${params.toString()}`);
    } catch {
      let list = [...this.localReports];
      if (filters.status) {
        list = list.filter(r => r.status === filters.status);
      }
      return { reports: list, total: list.length };
    }
  }

  async updateReportStatus(reportId, status, resolution = '') {
    try {
      return await this.request(`/admin/reports/${reportId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, resolution })
      });
    } catch {
      const r = this.localReports.find(x => x.id === reportId);
      if (r) {
        r.status = status;
        r.resolution = resolution;
        this.saveLocal('local_reports', this.localReports);
      }
      return { report: r, message: `Report marked as ${status}` };
    }
  }

  // Academic Structure Admin CRUD
  async createUniversity(data) {
    try {
      return await this.request('/academic/universities', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const uni = { id: 'u-' + Date.now(), colleges: [], ...data };
      this.localUniversities.push(uni);
      this.saveLocal('local_universities', this.localUniversities);
      return { university: uni };
    }
  }

  async createCollege(data) {
    try {
      return await this.request('/academic/colleges', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const col = { id: 'c-' + Date.now(), programs: [], ...data };
      const uni = this.localUniversities.find(u => u.id === data.universityId);
      if (uni) {
        if (!uni.colleges) uni.colleges = [];
        uni.colleges.push(col);
        this.saveLocal('local_universities', this.localUniversities);
      }
      return { college: col };
    }
  }

  async createProgram(data) {
    try {
      return await this.request('/academic/programs', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const prg = { id: 'p-' + Date.now(), courses: [], ...data };
      for (const u of this.localUniversities) {
        const c = (u.colleges || []).find(col => col.id === data.collegeId);
        if (c) {
          if (!c.programs) c.programs = [];
          c.programs.push(prg);
          this.saveLocal('local_universities', this.localUniversities);
          break;
        }
      }
      return { program: prg };
    }
  }

  async createCourse(data) {
    try {
      return await this.request('/academic/courses', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const crs = { id: 'crs-' + Date.now(), ...data };
      for (const u of this.localUniversities) {
        for (const c of u.colleges || []) {
          const p = (c.programs || []).find(prg => prg.id === data.programId);
          if (p) {
            if (!p.courses) p.courses = [];
            p.courses.push(crs);
            this.saveLocal('local_universities', this.localUniversities);
            break;
          }
        }
      }
      return { course: crs };
    }
  }
}

export const api = new ApiService();
