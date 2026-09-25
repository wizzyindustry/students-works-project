import { UserModel } from '../models/User.js';
import { MaterialModel } from '../models/Material.js';
import { ReportModel } from '../models/Interactions.js';
import { AppError } from '../middleware/errorHandler.js';

export const adminController = {
  async getDashboardStats(req, res, next) {
    try {
      const [userStats, materialStats, reportStats] = await Promise.all([
        (async () => {
          const result = await import('../config/database.js').then(m => m.query(`
            SELECT 
              COUNT(*) as total_users,
              COUNT(*) FILTER (WHERE role = 'student') as total_students,
              COUNT(*) FILTER (WHERE role = 'admin') as total_admins,
              COUNT(*) FILTER (WHERE is_active = true) as active_users,
              COUNT(*) FILTER (WHERE is_suspended = true) as suspended_users
            FROM users
          `));
          return result.rows[0];
        })(),
        MaterialModel.getStats(),
        ReportModel.getStats()
      ]);

      const courseResult = await import('../config/database.js').then(m => m.query(`
        SELECT COUNT(*) as active_courses FROM courses WHERE is_active = true
      `));

      res.json({
        stats: {
          users: {
            total: parseInt(userStats.total_users),
            students: parseInt(userStats.total_students),
            admins: parseInt(userStats.total_admins),
            active: parseInt(userStats.active_users),
            suspended: parseInt(userStats.suspended_users)
          },
          materials: {
            total: parseInt(materialStats.total_materials),
            pending: parseInt(materialStats.pending_materials),
            approved: parseInt(materialStats.approved_materials),
            rejected: parseInt(materialStats.rejected_materials),
            totalDownloads: parseInt(materialStats.total_downloads)
          },
          reports: {
            total: parseInt(reportStats.total_reports),
            pending: parseInt(reportStats.pending_reports),
            reviewed: parseInt(reportStats.reviewed_reports),
            resolved: parseInt(reportStats.resolved_reports),
            dismissed: parseInt(reportStats.dismissed_reports)
          },
          courses: {
            active: parseInt(courseResult.rows[0].active_courses)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // User management
  async listUsers(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        role: req.query.role,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        universityId: req.query.universityId,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await UserModel.list(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserModel.findByIdWithRelations(id);
      if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
      }

      const stats = await UserModel.getStats(id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          studentNumber: user.student_number,
          universityId: user.university_id,
          universityName: user.university_name,
          universityCode: user.university_code,
          programId: user.program_id,
          programName: user.program_name,
          programCode: user.program_code,
          collegeName: user.college_name,
          yearOfStudy: user.year_of_study,
          profileImageUrl: user.profile_image_url,
          role: user.role,
          isActive: user.is_active,
          isSuspended: user.is_suspended,
          suspensionReason: user.suspension_reason,
          lastLoginAt: user.last_login_at,
          emailVerified: user.email_verified,
          createdAt: user.created_at
        },
        stats
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserModel.update(id, req.body);
      if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
      }
      res.json({ message: 'User updated', user });
    } catch (error) {
      next(error);
    }
  },

  async suspendUser(req, res, next) {
    try {
      const { id } = req.params;
      const { isSuspended, reason } = req.body;

      if (id === req.userId) {
        throw new AppError('Cannot suspend yourself', 400, 'SELF_SUSPEND');
      }

      const updates = { is_suspended: isSuspended };
      if (isSuspended && reason) {
        updates.suspension_reason = reason;
      } else if (!isSuspended) {
        updates.suspension_reason = null;
      }

      const user = await UserModel.update(id, updates);
      if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
      }

      res.json({ message: isSuspended ? 'User suspended' : 'User unsuspended', user });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (id === req.userId) {
        throw new AppError('Cannot delete yourself', 400, 'SELF_DELETE');
      }

      await import('../config/database.js').then(m => m.query('DELETE FROM users WHERE id = $1', [id]));
      res.json({ message: 'User deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Material management
  async listMaterials(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        search: req.query.search,
        courseId: req.query.courseId,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await MaterialModel.listForAdmin(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async approveMaterial(req, res, next) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      const material = await MaterialModel.updateStatus(id, status, req.userId, rejectionReason);
      if (!material) {
        throw new AppError('Material not found', 404, 'NOT_FOUND');
      }

      res.json({
        message: `Material ${status}`,
        material: {
          id: material.id,
          title: material.title,
          status: material.status,
          rejectionReason: material.rejection_reason
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteMaterial(req, res, next) {
    try {
      const { id } = req.params;
      const material = await MaterialModel.findById(id);
      if (!material) {
        throw new AppError('Material not found', 404, 'NOT_FOUND');
      }

      import('../utils/fileUpload.js').then(m => m.deleteFile(material.file_path));
      await MaterialModel.delete(id);

      res.json({ message: 'Material deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Reports
  async listReports(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        materialId: req.query.materialId,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await ReportModel.list(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateReportStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, resolution } = req.body;

      const report = await ReportModel.updateStatus(id, status, req.userId, resolution);
      if (!report) {
        throw new AppError('Report not found', 404, 'NOT_FOUND');
      }

      res.json({ message: `Report ${status}`, report });
    } catch (error) {
      next(error);
    }
  }
};