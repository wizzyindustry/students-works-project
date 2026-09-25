import { query } from '../config/database.js';

export const DownloadModel = {
  async create(data) {
    const { materialId, userId, ipAddress, userAgent } = data;
    const result = await query(`
      INSERT INTO downloads (material_id, user_id, ip_address, user_agent)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [materialId, userId, ipAddress, userAgent]);
    return result.rows[0];
  },

  async findByMaterialAndUser(materialId, userId) {
    const result = await query(
      'SELECT * FROM downloads WHERE material_id = $1 AND user_id = $2 ORDER BY downloaded_at DESC LIMIT 1',
      [materialId, userId]
    );
    return result.rows[0];
  },

  async listByUser(userId, filters = {}) {
    let whereClause = 'WHERE d.user_id = $1';
    const values = [userId];
    let paramCount = 2;

    if (filters.limit) {
      // handled in query
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const result = await query(`
      SELECT d.*, m.title, m.file_name, m.file_path,
             c.name as course_name, c.code as course_code
      FROM downloads d
      LEFT JOIN materials m ON d.material_id = m.id
      LEFT JOIN courses c ON m.course_id = c.id
      ${whereClause}
      ORDER BY d.downloaded_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...values, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) FROM downloads d ${whereClause}
    `, values);

    return {
      downloads: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    };
  },

  async getMaterialDownloadStats(materialId) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_downloads,
        COUNT(DISTINCT user_id) as unique_users,
        DATE_TRUNC('day', downloaded_at) as date,
        COUNT(*) as daily_downloads
      FROM downloads
      WHERE material_id = $1
      GROUP BY DATE_TRUNC('day', downloaded_at)
      ORDER BY date DESC
      LIMIT 30
    `, [materialId]);
    return result.rows;
  }
};

export const RatingModel = {
  async create(data) {
    const { materialId, userId, rating, comment } = data;
    const result = await query(`
      INSERT INTO ratings (material_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [materialId, userId, rating, comment]);
    return result.rows[0];
  },

  async findByMaterialAndUser(materialId, userId) {
    const result = await query(
      'SELECT * FROM ratings WHERE material_id = $1 AND user_id = $2',
      [materialId, userId]
    );
    return result.rows[0];
  },

  async update(id, rating, comment) {
    const result = await query(`
      UPDATE ratings SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [rating, comment, id]);
    return result.rows[0];
  },

  async delete(id) {
    await query('DELETE FROM ratings WHERE id = $1', [id]);
  },

  async listByMaterial(materialId, filters = {}) {
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const result = await query(`
      SELECT r.*, u.full_name as user_name, u.student_number
      FROM ratings r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.material_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [materialId, limit, offset]);
    return result.rows;
  },

  async getMaterialStats(materialId) {
    const result = await query(`
      SELECT 
        COALESCE(AVG(rating)::numeric(3,2), 0) as average_rating,
        COUNT(*) as rating_count,
        COUNT(*) FILTER (WHERE rating = 5) as five_star,
        COUNT(*) FILTER (WHERE rating = 4) as four_star,
        COUNT(*) FILTER (WHERE rating = 3) as three_star,
        COUNT(*) FILTER (WHERE rating = 2) as two_star,
        COUNT(*) FILTER (WHERE rating = 1) as one_star
      FROM ratings WHERE material_id = $1
    `, [materialId]);
    return result.rows[0];
  }
};

export const ReportModel = {
  async create(data) {
    const { materialId, reporterId, reason, description } = data;
    const result = await query(`
      INSERT INTO reports (material_id, reporter_id, reason, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [materialId, reporterId, reason, description]);
    return result.rows[0];
  },

  async findByMaterialAndReporter(materialId, reporterId) {
    const result = await query(
      'SELECT * FROM reports WHERE material_id = $1 AND reporter_id = $2',
      [materialId, reporterId]
    );
    return result.rows[0];
  },

  async list(filters = {}) {
    let whereClause = 'WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      whereClause += ` AND r.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }
    if (filters.materialId) {
      whereClause += ` AND r.material_id = $${paramCount}`;
      values.push(filters.materialId);
      paramCount++;
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const result = await query(`
      SELECT r.*, 
             m.title as material_title, m.file_name,
             rep.full_name as reporter_name, rep.email as reporter_email,
             rev.full_name as reviewed_by_name
      FROM reports r
      LEFT JOIN materials m ON r.material_id = m.id
      LEFT JOIN users rep ON r.reporter_id = rep.id
      LEFT JOIN users rev ON r.reviewed_by = rev.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...values, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) FROM reports r ${whereClause}
    `, values);

    return {
      reports: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    };
  },

  async updateStatus(id, status, reviewerId, resolution = null) {
    const result = await query(`
      UPDATE reports 
      SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP, resolution = $3
      WHERE id = $4
      RETURNING *
    `, [status, reviewerId, resolution, id]);
    return result.rows[0];
  },

  async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
        COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_reports,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_reports,
        COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed_reports
      FROM reports
    `);
    return result.rows[0];
  }
};

export const BookmarkModel = {
  async create(materialId, userId) {
    const result = await query(`
      INSERT INTO bookmarks (material_id, user_id)
      VALUES ($1, $2)
      RETURNING *
    `, [materialId, userId]);
    return result.rows[0];
  },

  async delete(materialId, userId) {
    await query('DELETE FROM bookmarks WHERE material_id = $1 AND user_id = $2', [materialId, userId]);
  },

  async findByUser(userId, filters = {}) {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const result = await query(`
      SELECT b.*, m.title, m.description, m.file_name, m.file_path, m.download_count, m.average_rating,
             c.name as course_name, c.code as course_code,
             mt.name as material_type_name,
             upl.full_name as uploader_name
      FROM bookmarks b
      LEFT JOIN materials m ON b.material_id = m.id
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN material_types mt ON m.material_type_id = mt.id
      LEFT JOIN users upl ON m.uploader_id = upl.id
      WHERE b.user_id = $1 AND m.status = 'approved'
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    return result.rows;
  },

  async isBookmarked(materialId, userId) {
    const result = await query(
      'SELECT 1 FROM bookmarks WHERE material_id = $1 AND user_id = $2',
      [materialId, userId]
    );
    return result.rows.length > 0;
  }
};