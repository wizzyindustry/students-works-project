import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { userFiltersValidation, suspendUserValidation, uuidParam } from '../validators/user.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', userFiltersValidation, validate, adminController.listUsers);
router.get('/users/:id', uuidParam(), validate, adminController.getUser);
router.put('/users/:id', uuidParam(), validate, adminController.updateUser);
router.put('/users/:id/suspend', uuidParam(), suspendUserValidation, validate, adminController.suspendUser);
router.delete('/users/:id', uuidParam(), validate, adminController.deleteUser);

// Material management
router.get('/materials', adminController.listMaterials);
router.put('/materials/:id/approve', uuidParam(), validate, adminController.approveMaterial);
router.delete('/materials/:id', uuidParam(), validate, adminController.deleteMaterial);

// Reports
router.get('/reports', adminController.listReports);
router.put('/reports/:id/status', uuidParam(), validate, adminController.updateReportStatus);

export default router;