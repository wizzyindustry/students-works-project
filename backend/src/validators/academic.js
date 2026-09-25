import { body, param, query } from 'express-validator';

export const createUniversityValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('University name must be 2-255 characters'),
  body('code')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Code must be uppercase alphanumeric'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description too long')
];

export const updateUniversityValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('University name must be 2-255 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Code must be uppercase alphanumeric'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description too long'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean')
];

export const createCollegeValidation = [
  body('universityId')
    .isUUID()
    .withMessage('Valid university ID required'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('College name must be 2-255 characters'),
  body('code')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Code must be uppercase alphanumeric'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description too long')
];

export const createProgramValidation = [
  body('collegeId')
    .isUUID()
    .withMessage('Valid college ID required'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Program name must be 2-255 characters'),
  body('code')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Code must be uppercase alphanumeric'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description too long'),
  body('durationYears')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Duration must be 1-10 years')
];

export const createCourseValidation = [
  body('programId')
    .isUUID()
    .withMessage('Valid program ID required'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Course name must be 2-255 characters'),
  body('code')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Z0-9\s\-\.]+$/)
    .withMessage('Invalid course code format'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description too long'),
  body('year')
    .isInt({ min: 1, max: 10 })
    .withMessage('Year must be 1-10'),
  body('semester')
    .isInt({ min: 1, max: 2 })
    .withMessage('Semester must be 1 or 2'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be 1-10')
];

export const updateCourseValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Course name must be 2-255 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Z0-9\s\-\.]+$/)
    .withMessage('Invalid course code format'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description too long'),
  body('year')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Year must be 1-10'),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 2 })
    .withMessage('Semester must be 1 or 2'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be 1-10'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean')
];

export const uuidParam = (paramName = 'id') => [
  param(paramName)
    .isUUID()
    .withMessage(`Invalid ${paramName}`)
];

export const paginationValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be 1-100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative')
];