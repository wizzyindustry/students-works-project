import { RatingModel, ReportModel, BookmarkModel, DownloadModel } from '../models/Interactions.js';
import { MaterialModel } from '../models/Material.js';
import { AppError } from '../middleware/errorHandler.js';

export const interactionController = {
  // Ratings
  async rateMaterial(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const userId = req.userId;

      const material = await MaterialModel.findByIdForDownload(id);
      if (!material) {
        throw new AppError('Material not found or not approved', 404, 'NOT_FOUND');
      }

      const existingRating = await RatingModel.findByMaterialAndUser(id, userId);
      let result;

      if (existingRating) {
        result = await RatingModel.update(existingRating.id, rating, comment);
      } else {
        result = await RatingModel.create({ materialId: id, userId, rating, comment });
      }

      await MaterialModel.updateRatingStats(id);

      const stats = await RatingModel.getMaterialStats(id);

      res.json({
        message: existingRating ? 'Rating updated' : 'Rating submitted',
        rating: {
          id: result.id,
          rating: result.rating,
          comment: result.comment,
          createdAt: result.created_at
        },
        stats
      });
    } catch (error) {
      next(error);
    }
  },

  async getRatings(req, res, next) {
    try {
      const { id } = req.params;
      const ratings = await RatingModel.listByMaterial(id, {
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      });
      const stats = await RatingModel.getMaterialStats(id);
      res.json({ ratings, stats });
    } catch (error) {
      next(error);
    }
  },

  async deleteRating(req, res, next) {
    try {
      const { id, ratingId } = req.params;
      const rating = await RatingModel.findByMaterialAndUser(id, req.userId);
      if (!rating || rating.id !== ratingId) {
        throw new AppError('Rating not found', 404, 'NOT_FOUND');
      }
      await RatingModel.delete(ratingId);
      await MaterialModel.updateRatingStats(id);
      res.json({ message: 'Rating deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Reports
  async reportMaterial(req, res, next) {
    try {
      const { id } = req.params;
      const { reason, description } = req.body;
      const reporterId = req.userId;

      const material = await MaterialModel.findById(id);
      if (!material) {
        throw new AppError('Material not found', 404, 'NOT_FOUND');
      }

      const existingReport = await ReportModel.findByMaterialAndReporter(id, reporterId);
      if (existingReport) {
        throw new AppError('You have already reported this material', 409, 'ALREADY_REPORTED');
      }

      const report = await ReportModel.create({ materialId: id, reporterId, reason, description });

      res.status(201).json({
        message: 'Report submitted successfully',
        report: {
          id: report.id,
          reason: report.reason,
          status: report.status,
          createdAt: report.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Bookmarks
  async toggleBookmark(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const material = await MaterialModel.findByIdForDownload(id);
      if (!material) {
        throw new AppError('Material not found or not approved', 404, 'NOT_FOUND');
      }

      const isBookmarked = await BookmarkModel.isBookmarked(id, userId);

      if (isBookmarked) {
        await BookmarkModel.delete(id, userId);
        res.json({ message: 'Bookmark removed', bookmarked: false });
      } else {
        await BookmarkModel.create(id, userId);
        res.json({ message: 'Material bookmarked', bookmarked: true });
      }
    } catch (error) {
      next(error);
    }
  },

  async getBookmarks(req, res, next) {
    try {
      const bookmarks = await BookmarkModel.findByUser(req.userId, {
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      });

      res.json({
        bookmarks: bookmarks.map(b => ({
          id: b.id,
          material: {
            id: b.material_id,
            title: b.title,
            description: b.description,
            fileName: b.file_name,
            downloadCount: b.download_count,
            averageRating: parseFloat(b.average_rating) || 0,
            course: {
              name: b.course_name,
              code: b.course_code
            },
            materialType: {
              name: b.material_type_name
            },
            uploader: {
              name: b.uploader_name
            }
          },
          createdAt: b.created_at
        }))
      });
    } catch (error) {
      next(error);
    }
  },

  // Downloads
  async getDownloadHistory(req, res, next) {
    try {
      const result = await DownloadModel.listByUser(req.userId, {
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      });

      res.json({
        downloads: result.downloads.map(d => ({
          id: d.id,
          material: {
            id: d.material_id,
            title: d.title,
            fileName: d.file_name,
            course: {
              name: d.course_name,
              code: d.course_code
            }
          },
          downloadedAt: d.downloaded_at
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
  }
};