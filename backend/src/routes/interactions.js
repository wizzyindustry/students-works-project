import { Router } from 'express';
import { interactionController } from '../controllers/interactionController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { rateMaterialValidation, reportMaterialValidation, materialIdParam } from '../validators/material.js';
import { uuidParam } from '../validators/academic.js';

const router = Router();

router.use(authenticateToken);

// Ratings
router.post('/materials/:id/rate', materialIdParam, rateMaterialValidation, validate, interactionController.rateMaterial);
router.get('/materials/:id/ratings', materialIdParam, validate, interactionController.getRatings);
router.delete('/materials/:id/ratings/:ratingId', materialIdParam, uuidParam('ratingId'), validate, interactionController.deleteRating);

// Reports
router.post('/materials/:id/report', materialIdParam, reportMaterialValidation, validate, interactionController.reportMaterial);

// Bookmarks
router.post('/materials/:id/bookmark', materialIdParam, validate, interactionController.toggleBookmark);
router.get('/bookmarks', interactionController.getBookmarks);

// Downloads
router.get('/downloads', interactionController.getDownloadHistory);

export default router;