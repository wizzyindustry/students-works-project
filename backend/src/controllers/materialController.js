import { MaterialModel, MaterialTypeModel } from '../models/Material.js';
import { DownloadModel } from '../models/Interactions.js';
import { processUploadedFile, deleteFile, formatFileSize } from '../utils/fileUpload.js';
import { AppError } from '../middleware/errorHandler.js';
import fs from 'fs';
import path from 'path';

export const materialController = {
  async upload(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400, 'NO_FILE');
      }

      const { title, description, courseId, materialTypeId, academicYear, semester } = req.body;
      const uploaderId = req.userId;

      const processedFile = await processUploadedFile(req.file);

      // Check for duplicate
      const existing = await MaterialModel.findByFileHash(processedFile.hash);
      if (existing) {
        deleteFile(processedFile.path);
        throw new AppError('This file has already been uploaded', 409, 'DUPLICATE_FILE');
      }

      const material = await MaterialModel.create({
        title,
        description,
        courseId,
        materialTypeId: materialTypeId || null,
        uploaderId,
        fileName: processedFile.originalName,
        filePath: processedFile.path,
        fileSize: processedFile.size,
        mimeType: processedFile.mimeType,
        fileHash: processedFile.hash,
        academicYear: academicYear || null,
        semester: semester ? parseInt(semester) : null
      });

      res.status(201).json({
        message: 'Material uploaded successfully. Pending admin approval.',
        material: {
          id: material.id,
          title: material.title,
          status: material.status,
          fileName: material.file_name,
          fileSize: formatFileSize(material.file_size),
          createdAt: material.created_at
        }
      });
    } catch (error) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      next(error);
    }
  },

  async getMaterial(req, res, next) {
    try {
      const { id } = req.params;
      const material = await MaterialModel.findById(id);

      if (!material) {
        throw new AppError('Material not found', 404, 'NOT_FOUND');
      }

      // Check access permissions
      if (material.status !== 'approved') {
        const isUploader = material.uploader_id === req.userId;
        const isAdmin = req.user?.role === 'admin';
        if (!isUploader && !isAdmin) {
          throw new AppError('Material not available', 403, 'NOT_APPROVED');
        }
      }

      await MaterialModel.incrementViewCount(id);

      const isBookmarked = req.userId 
        ? await import('../models/Interactions.js').then(m => m.BookmarkModel.isBookmarked(id, req.userId))
        : false;

      const userRating = req.userId
        ? await import('../models/Interactions.js').then(m => m.RatingModel.findByMaterialAndUser(id, req.userId))
        : null;

      const ratingStats = await import('../models/Interactions.js').then(m => m.RatingModel.getMaterialStats(id));

      res.json({
        material: {
          id: material.id,
          title: material.title,
          description: material.description,
          course: {
            id: material.course_id,
            name: material.course_name,
            code: material.course_code,
            year: material.course_year,
            semester: material.course_semester
          },
          program: {
            name: material.program_name,
            code: material.program_code
          },
          university: {
            name: material.university_name
          },
          materialType: {
            name: material.material_type_name,
            icon: material.material_type_icon
          },
          uploader: {
            name: material.uploader_name,
            studentNumber: material.uploader_student_number
          },
          fileName: material.file_name,
          fileSize: formatFileSize(material.file_size),
          mimeType: material.mime_type,
          academicYear: material.academic_year,
          semester: material.semester,
          status: material.status,
          downloadCount: material.download_count,
          viewCount: material.view_count,
          averageRating: parseFloat(material.average_rating) || 0,
          ratingCount: material.rating_count,
          isBookmarked,
          userRating: userRating?.rating || null,
          ratingStats,
          createdAt: material.created_at,
          updatedAt: material.updated_at
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async download(req, res, next) {
    try {
      const { id } = req.params;
      const material = await MaterialModel.findByIdForDownload(id);

      if (!material) {
        throw new AppError('Material not found or not approved', 404, 'NOT_FOUND');
      }

      const filePath = path.resolve(material.file_path);
      if (!fs.existsSync(filePath)) {
        throw new AppError('File not found on server', 404, 'FILE_MISSING');
      }

      // Record download
      await DownloadModel.create({
        materialId: id,
        userId: req.userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await MaterialModel.incrementDownloadCount(id);

      res.download(filePath, material.file_name, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const filters = {
        courseId: req.query.courseId,
        materialTypeId: req.query.materialTypeId,
        academicYear: req.query.academicYear,
        semester: req.query.semester ? parseInt(req.query.semester) : undefined,
        uploaderId: req.query.uploaderId,
        search: req.query.search,
        universityId: req.query.universityId,
        programId: req.query.programId,
        year: req.query.year ? parseInt(req.query.year) : undefined,
        courseSemester: req.query.courseSemester ? parseInt(req.query.courseSemester) : undefined,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await MaterialModel.list(filters);

      res.json({
        materials: result.materials.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          course: {
            id: m.course_id,
            name: m.course_name,
            code: m.course_code,
            year: m.course_year,
            semester: m.course_semester
          },
          program: {
            name: m.program_name,
            code: m.program_code
          },
          university: {
            name: m.university_name
          },
          materialType: {
            name: m.material_type_name,
            icon: m.material_type_icon
          },
          uploader: {
            name: m.uploader_name
          },
          fileName: m.file_name,
          fileSize: formatFileSize(m.file_size),
          academicYear: m.academic_year,
          semester: m.semester,
          downloadCount: m.download_count,
          averageRating: parseFloat(m.average_rating) || 0,
          ratingCount: m.rating_count,
          createdAt: m.created_at
        })),
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async listUserUploads(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await MaterialModel.getUserUploads(req.userId, filters);

      res.json({
        materials: result.materials.map(m => ({
          id: m.id,
          title: m.title,
          course: {
            name: m.course_name,
            code: m.course_code
          },
          materialType: {
            name: m.material_type_name
          },
          fileName: m.file_name,
          fileSize: formatFileSize(m.file_size),
          status: m.status,
          rejectionReason: m.rejection_reason,
          downloadCount: m.download_count,
          averageRating: parseFloat(m.average_rating) || 0,
          createdAt: m.created_at
        })),
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const material = await MaterialModel.findById(id);

      if (!material) {
        throw new AppError('Material not found', 404, 'NOT_FOUND');
      }

      if (material.uploader_id !== req.userId && req.user?.role !== 'admin') {
        throw new AppError('Not authorized to update this material', 403, 'FORBIDDEN');
      }

      if (material.status !== 'pending' && req.user?.role !== 'admin') {
        throw new AppError('Cannot update approved/rejected material', 400, 'INVALID_STATUS');
      }

      const updated = await MaterialModel.update(id, req.body);

      res.json({
        message: 'Material updated successfully',
        material: {
          id: updated.id,
          title: updated.title,
          description: updated.description,
          status: updated.status
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const material = await MaterialModel.findById(id);

      if (!material) {
        throw new AppError('Material not found', 404, 'NOT_FOUND');
      }

      if (material.uploader_id !== req.userId && req.user?.role !== 'admin') {
        throw new AppError('Not authorized to delete this material', 403, 'FORBIDDEN');
      }

      deleteFile(material.file_path);
      await MaterialModel.delete(id);

      res.json({ message: 'Material deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getMaterialTypes(req, res, next) {
    try {
      const types = await MaterialTypeModel.findAll();
      res.json({ types });
    } catch (error) {
      next(error);
    }
  },

  async getStats(req, res, next) {
    try {
      const stats = await MaterialModel.getStats();
      res.json({ stats });
    } catch (error) {
      next(error);
    }
  }
};