import { body, param, query } from 'express-validator';

export const uploadMaterialValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Title must be 3-500 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description too long'),
  body('courseId')
    .isUUID()
    .withMessage('Valid course ID is required'),
  body('materialTypeId')
    .optional()
    .isUUID()
    .withMessage('Invalid material type ID'),
  body('academicYear')
    .optional()
    .trim()
    .matches(/^\d{4}(-\d{4})?$/)
    .withMessage('Academic year format: YYYY or YYYY-YYYY'),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 2 })
    .withMessage('Semester must be 1 or 2')
];

export const updateMaterialValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Title must be 3-500 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description too long'),
  body('courseId')
    .optional()
    .isUUID()
    .withMessage('Invalid course ID'),
  body('materialTypeId')
    .optional()
    .isUUID()
    .withMessage('Invalid material type ID'),
  body('academicYear')
    .optional()
    .trim()
    .matches(/^\d{4}(-\d{4})?$/)
    .withMessage('Academic year format: YYYY or YYYY-YYYY'),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 2 })
    .withMessage('Semester must be 1 or 2'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be boolean')
];

export const materialFiltersValidation = [
  query('courseId')
    .optional()
    .isUUID()
    .withMessage('Invalid course ID'),
  query('materialTypeId')
    .optional()
    .isUUID()
    .withMessage('Invalid material type ID'),
  query('academicYear')
    .optional()
    .trim()
    .matches(/^\d{4}(-\d{4})?$/)
    .withMessage('Invalid academic year format'),
  query('semester')
    .optional()
    .isInt({ min: 1, max: 2 })
    .withMessage('Semester must be 1 or 2'),
  query('universityId')
    .optional()
    .isUUID()
    .withMessage('Invalid university ID'),
  query('programId')
    .optional()
    .isUUID()
    .withMessage('Invalid program ID'),
  query('year')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Year must be 1-10'),
  query('courseSemester')
    .optional()
    .isInt({ min: 1, max: 2 })
    .withMessage('Course semester must be 1 or 2'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query too long'),
  query('sortBy')
    .optional()
    .isIn(['created_at', 'title', 'download_count', 'average_rating', 'view_count'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be 1-100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative')
];

export const approveMaterialValidation = [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be approved or rejected'),
  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Rejection reason too long')
];

export const rateMaterialValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be 1-5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment too long')
];

export const reportMaterialValidation = [
  body('reason')
    .isIn(['incorrect', 'spam', 'duplicate', 'copyright', 'offensive', 'malware', 'wrong_course', 'other'])
    .withMessage('Invalid report reason'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description too long')
];

export const materialIdParam = [
  param('id')
    .isUUID()
    .withMessage('Invalid material ID')
];