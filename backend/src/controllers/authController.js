import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserModel } from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password, fullName, studentNumber, universityId, programId, yearOfStudy } = req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
      }

      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

      const user = await UserModel.create({
        email,
        passwordHash,
        fullName,
        studentNumber,
        universityId,
        programId,
        yearOfStudy,
        role: 'student'
      });

      const { accessToken, refreshToken } = generateTokens(user.id);

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          studentNumber: user.student_number,
          role: user.role
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      if (!user.is_active) {
        throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
      }

      if (user.is_suspended) {
        throw new AppError(`Account suspended: ${user.suspension_reason || 'Contact administrator'}`, 403, 'ACCOUNT_SUSPENDED');
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      await UserModel.updateLastLogin(user.id);

      const { accessToken, refreshToken } = generateTokens(user.id);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          studentNumber: user.student_number,
          role: user.role,
          universityId: user.university_id,
          programId: user.program_id,
          yearOfStudy: user.year_of_study,
          profileImageUrl: user.profile_image_url
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError('Refresh token required', 400, 'TOKEN_REQUIRED');
      }

      const decoded = verifyRefreshToken(refreshToken);
      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid token type', 401, 'INVALID_TOKEN_TYPE');
      }

      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.is_active || user.is_suspended) {
        throw new AppError('Invalid or suspended user', 401, 'INVALID_USER');
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

      res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return next(new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN'));
      }
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.json({ message: 'If the email exists, a reset link has been sent' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await UserModel.setPasswordResetToken(user.id, resetToken, expires);

      // In production, send email with reset link
      // For development, return token in response
      if (process.env.NODE_ENV === 'development') {
        return res.json({ 
          message: 'Password reset token generated (development mode)',
          resetToken 
        });
      }

      res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const user = await UserModel.findByPasswordResetToken(token);
      if (!user) {
        throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
      }

      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));
      await UserModel.updatePassword(user.id, passwordHash);

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId;

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
      }

      const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));
      await UserModel.updatePassword(userId, passwordHash);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await UserModel.findByIdWithRelations(req.userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const stats = await UserModel.getStats(req.userId);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          studentNumber: user.student_number,
          universityId: user.university_id,
          universityName: user.university_name,
          universityCode: user.university_code,
          programId: user.program_id,
          programName: user.program_name,
          programCode: user.program_code,
          collegeName: user.college_name,
          yearOfStudy: user.year_of_study,
          profileImageUrl: user.profile_image_url,
          role: user.role,
          isActive: user.is_active,
          isSuspended: user.is_suspended,
          createdAt: user.created_at
        },
        stats
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const userId = req.userId;
      const updates = req.body;

      const user = await UserModel.update(userId, updates);

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          studentNumber: user.student_number,
          universityId: user.university_id,
          programId: user.program_id,
          yearOfStudy: user.year_of_study,
          profileImageUrl: user.profile_image_url,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
};