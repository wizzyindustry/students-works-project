import { Router } from 'express';
import { academicController } from '../controllers/academicController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { 
  createUniversityValidation, updateUniversityValidation, 
  createCollegeValidation, 
  createProgramValidation, 
  createCourseValidation, updateCourseValidation,
  uuidParam, paginationValidation
} from '../validators/academic.js';

const router = Router();

// Public routes for browsing hierarchy
router.get('/hierarchy', academicController.getHierarchy);
router.get('/universities', academicController.listUniversities);
router.get('/universities/:id', uuidParam(), validate, academicController.getUniversity);
router.get('/universities/:universityId/colleges', uuidParam('universityId'), validate, academicController.listColleges);
router.get('/colleges/:id', uuidParam(), validate, academicController.getCollege);
router.get('/colleges/:collegeId/programs', uuidParam('collegeId'), validate, academicController.listPrograms);
router.get('/programs', academicController.listAllPrograms);
router.get('/programs/:id', uuidParam(), validate, academicController.getProgram);
router.get('/programs/:programId/courses', uuidParam('programId'), validate, academicController.listCourses);
router.get('/programs/:programId/courses/by-year-semester', uuidParam('programId'), validate, academicController.listCoursesByYearSemester);
router.get('/courses/:id', uuidParam(), validate, academicController.getCourse);

// Admin routes for managing academic structure
router.post('/universities', authenticateToken, requireAdmin, createUniversityValidation, validate, academicController.createUniversity);
router.put('/universities/:id', authenticateToken, requireAdmin, uuidParam(), updateUniversityValidation, validate, academicController.updateUniversity);
router.delete('/universities/:id', authenticateToken, requireAdmin, uuidParam(), validate, academicController.deleteUniversity);

router.post('/colleges', authenticateToken, requireAdmin, createCollegeValidation, validate, academicController.createCollege);
router.put('/colleges/:id', authenticateToken, requireAdmin, uuidParam(), createCollegeValidation, validate, academicController.updateCollege);
router.delete('/colleges/:id', authenticateToken, requireAdmin, uuidParam(), validate, academicController.deleteCollege);

router.post('/programs', authenticateToken, requireAdmin, createProgramValidation, validate, academicController.createProgram);
router.put('/programs/:id', authenticateToken, requireAdmin, uuidParam(), createProgramValidation, validate, academicController.updateProgram);
router.delete('/programs/:id', authenticateToken, requireAdmin, uuidParam(), validate, academicController.deleteProgram);

router.post('/courses', authenticateToken, requireAdmin, createCourseValidation, validate, academicController.createCourse);
router.put('/courses/:id', authenticateToken, requireAdmin, uuidParam(), updateCourseValidation, validate, academicController.updateCourse);
router.delete('/courses/:id', authenticateToken, requireAdmin, uuidParam(), validate, academicController.deleteCourse);

export default router;