import { body, param, query } from 'express-validator';

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('fullName')
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
    .withMessage('Year of study must be 1-10')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number')
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain uppercase, lowercase, and number')
];

export const updateProfileValidation = [
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
    .withMessage('Year of study must be 1-10')
];