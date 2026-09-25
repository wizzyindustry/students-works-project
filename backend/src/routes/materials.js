import { Router } from 'express';
import { materialController } from '../controllers/materialController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { uploadMaterialValidation, updateMaterialValidation, materialFiltersValidation, approveMaterialValidation, rateMaterialValidation, reportMaterialValidation, materialIdParam } from '../validators/material.js';
import { upload } from '../utils/fileUpload.js';

const router = Router();

router.get('/types', materialController.getMaterialTypes);

router.get('/', optionalAuth, materialFiltersValidation, validate, materialController.list);
router.get('/my-uploads', authenticateToken, materialController.listUserUploads);
router.get('/stats', materialController.getStats);

router.post('/', authenticateToken, upload.single('file'), uploadMaterialValidation, validate, materialController.upload);

router.get('/:id', optionalAuth, materialIdParam, validate, materialController.getMaterial);
router.post('/:id/download', authenticateToken, materialIdParam, validate, materialController.download);

router.put('/:id', authenticateToken, materialIdParam, updateMaterialValidation, validate, materialController.update);
router.delete('/:id', authenticateToken, materialIdParam, validate, materialController.delete);

export default router;