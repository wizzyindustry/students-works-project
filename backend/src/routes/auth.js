import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, changePasswordValidation, updateProfileValidation } from '../validators/auth.js';

const router = Router();

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

router.use(authenticateToken);

router.post('/change-password', changePasswordValidation, validate, authController.changePassword);
router.get('/profile', authController.getProfile);
router.put('/profile', updateProfileValidation, validate, authController.updateProfile);

export default router;