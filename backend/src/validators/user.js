import { body, param, query } from 'express-validator';

export const updateUserValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be 2-255 characters'),
  body('studentNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Student number too long'),
  body('universityId')
    .optional()
    .isUUID()
    .withMessage('Invalid university ID'),
  body('programId')
    .optional()
    .isUUID()
    .withMessage('Invalid program ID'),
  body('yearOfStudy')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Year of study must be 1-10'),
  body('role')
    .optional()
    .isIn(['student', 'admin'])
    .withMessage('Role must be student or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean'),
  body('isSuspended')
    .optional()
    .isBoolean()
    .withMessage('isSuspended must be boolean'),
  body('suspensionReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Suspension reason too long')
];

export const userFiltersValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query too long'),
  query('role')
    .optional()
    .isIn(['student', 'admin'])
    .withMessage('Invalid role'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean'),
  query('universityId')
    .optional()
    .isUUID()
    .withMessage('Invalid university ID'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be 1-100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative')
];

export const suspendUserValidation = [
  body('isSuspended')
    .isBoolean()
    .withMessage('isSuspended must be boolean'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason too long')
];