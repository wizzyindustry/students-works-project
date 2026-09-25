import { query } from '../config/database.js';

export const UserModel = {
  async create(userData) {
    const { email, passwordHash, fullName, studentNumber, universityId, programId, yearOfStudy, role = 'student' } = userData;
    const result = await query(`
      INSERT INTO users (email, password_hash, full_name, student_number, university_id, program_id, year_of_study, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, full_name, student_number, university_id, program_id, year_of_study, role, is_active, is_suspended, created_at
    `, [email, passwordHash, fullName, studentNumber, universityId, programId, yearOfStudy, role]);
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(`
      SELECT id, email, full_name, student_number, university_id, program_id, year_of_study, 
             profile_image_url, role, is_active, is_suspended, suspension_reason, last_login_at,
             email_verified, created_at, updated_at
      FROM users WHERE id = $1
    `, [id]);
    return result.rows[0];
  },

  async findByIdWithRelations(id) {
    const result = await query(`
      SELECT u.*, 
             un.name as university_name, un.code as university_code,
             p.name as program_name, p.code as program_code,
             c.name as college_name
      FROM users u
      LEFT JOIN universities un ON u.university_id = un.id
      LEFT JOIN programs p ON u.program_id = p.id
      LEFT JOIN colleges c ON p.college_id = c.id
      WHERE u.id = $1
    `, [id]);
    return result.rows[0];
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['full_name', 'student_number', 'university_id', 'program_id', 'year_of_study', 'profile_image_url', 'is_active', 'is_suspended', 'suspension_reason'];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${paramCount++}`);
        values.push(updates[field]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(`
      UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
      RETURNING id, email, full_name, student_number, university_id, program_id, year_of_study, 
                profile_image_url, role, is_active, is_suspended, updated_at
    `, values);
    return result.rows[0];
  },

  async updateLastLogin(id) {
    await query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
  },

  async setPasswordResetToken(id, token, expires) {
    await query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [token, expires, id]
    );
  },

  async findByPasswordResetToken(token) {
    const result = await query(
      'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP',
      [token]
    );
    return result.rows[0];
  },

  async updatePassword(id, passwordHash) {
    await query(
      'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, id]
    );
  },

  async verifyEmail(id) {
    await query(
      'UPDATE users SET email_verified = true, email_verification_token = NULL WHERE id = $1',
      [id]
    );
  },

  async findByVerificationToken(token) {
    const result = await query('SELECT * FROM users WHERE email_verification_token = $1', [token]);
    return result.rows[0];
  },

  async list(filters = {}) {
    let whereClause = 'WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.search) {
      whereClause += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR student_number ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }
    if (filters.role) {
      whereClause += ` AND role = $${paramCount}`;
      values.push(filters.role);
      paramCount++;
    }
    if (filters.isActive !== undefined) {
      whereClause += ` AND is_active = $${paramCount}`;
      values.push(filters.isActive);
      paramCount++;
    }
    if (filters.universityId) {
      whereClause += ` AND university_id = $${paramCount}`;
      values.push(filters.universityId);
      paramCount++;
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const result = await query(`
      SELECT u.*, un.name as university_name, p.name as program_name
      FROM users u
      LEFT JOIN universities un ON u.university_id = un.id
      LEFT JOIN programs p ON u.program_id = p.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...values, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) FROM users u ${whereClause}
    `, values);

    return {
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    };
  },

  async getStats(userId) {
    const uploadsResult = await query('SELECT COUNT(*) FROM materials WHERE uploader_id = $1', [userId]);
    const downloadsResult = await query('SELECT COUNT(*) FROM downloads WHERE user_id = $1', [userId]);
    const materialsDownloadCount = await query('SELECT COALESCE(SUM(download_count), 0) FROM materials WHERE uploader_id = $1', [userId]);

    return {
      uploadsCount: parseInt(uploadsResult.rows[0].count),
      downloadsCount: parseInt(downloadsResult.rows[0].count),
      totalDownloadsReceived: parseInt(materialsDownloadCount.rows[0].coalesce)
    };
  }
};