import { query } from '../config/database.js';

export const MaterialTypeModel = {
  async findAll(activeOnly = true) {
    const where = activeOnly ? 'WHERE is_active = true' : '';
    const result = await query(`SELECT * FROM material_types ${where} ORDER BY name`);
    return result.rows;
  },

  async findById(id) {
    const result = await query('SELECT * FROM material_types WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(data) {
    const result = await query(`
      INSERT INTO material_types (name, description, icon)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [data.name, data.description, data.icon]);
    return result.rows[0];
  }
};

export const MaterialModel = {
  async create(data) {
    const { title, description, courseId, materialTypeId, uploaderId, fileName, filePath, fileSize, mimeType, fileHash, academicYear, semester } = data;
    const result = await query(`
      INSERT INTO materials (title, description, course_id, material_type_id, uploader_id, file_name, file_path, file_size, mime_type, file_hash, academic_year, semester)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [title, description, courseId, materialTypeId, uploaderId, fileName, filePath, fileSize, mimeType, fileHash, academicYear, semester]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(`
      SELECT m.*, 
             c.name as course_name, c.code as course_code, c.year as course_year, c.semester as course_semester,
             p.name as program_name, p.code as program_code,
             col.name as college_name,
             u.name as university_name,
             mt.name as material_type_name, mt.icon as material_type_icon,
             upl.full_name as uploader_name, upl.student_number as uploader_student_number
      FROM materials m
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN programs p ON c.program_id = p.id
      LEFT JOIN colleges col ON p.college_id = col.id
      LEFT JOIN universities u ON col.university_id = u.id
      LEFT JOIN material_types mt ON m.material_type_id = mt.id
      LEFT JOIN users upl ON m.uploader_id = upl.id
      WHERE m.id = $1
    `, [id]);
    return result.rows[0];
  },

  async findByIdForDownload(id) {
    const result = await query(`
      SELECT m.*, c.name as course_name
      FROM materials m
      LEFT JOIN courses c ON m.course_id = c.id
      WHERE m.id = $1 AND m.status = 'approved'
    `, [id]);
    return result.rows[0];
  },

  async list(filters = {}) {
    let whereClause = 'WHERE m.status = $1';
    const values = ['approved'];
    let paramCount = 2;

    if (filters.courseId) {
      whereClause += ` AND m.course_id = $${paramCount}`;
      values.push(filters.courseId);
      paramCount++;
    }
    if (filters.materialTypeId) {
      whereClause += ` AND m.material_type_id = $${paramCount}`;
      values.push(filters.materialTypeId);
      paramCount++;
    }
    if (filters.academicYear) {
      whereClause += ` AND m.academic_year = $${paramCount}`;
      values.push(filters.academicYear);
      paramCount++;
    }
    if (filters.semester) {
      whereClause += ` AND m.semester = $${paramCount}`;
      values.push(filters.semester);
      paramCount++;
    }
    if (filters.uploaderId) {
      whereClause += ` AND m.uploader_id = $${paramCount}`;
      values.push(filters.uploaderId);
      paramCount++;
    }
    if (filters.search) {
      whereClause += ` AND (m.title ILIKE $${paramCount} OR m.description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }
    if (filters.universityId) {
      whereClause += ` AND u.id = $${paramCount}`;
      values.push(filters.universityId);
      paramCount++;
    }
    if (filters.programId) {
      whereClause += ` AND p.id = $${paramCount}`;
      values.push(filters.programId);
      paramCount++;
    }
    if (filters.year) {
      whereClause += ` AND c.year = $${paramCount}`;
      values.push(filters.year);
      paramCount++;
    }
    if (filters.courseSemester) {
      whereClause += ` AND c.semester = $${paramCount}`;
      values.push(filters.courseSemester);
      paramCount++;
    }

    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const allowedSortFields = ['created_at', 'title', 'download_count', 'average_rating', 'view_count'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const result = await query(`
      SELECT m.*, 
             c.name as course_name, c.code as course_code, c.year as course_year, c.semester as course_semester,
             p.name as program_name, p.code as program_code,
             u.name as university_name,
             mt.name as material_type_name, mt.icon as material_type_icon,
             upl.full_name as uploader_name
      FROM materials m
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN programs p ON c.program_id = p.id
      LEFT JOIN colleges col ON p.college_id = col.id
      LEFT JOIN universities u ON col.university_id = u.id
      LEFT JOIN material_types mt ON m.material_type_id = mt.id
      LEFT JOIN users upl ON m.uploader_id = upl.id
      ${whereClause}
      ORDER BY m.${safeSortBy} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...values, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) FROM materials m
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN programs p ON c.program_id = p.id
      LEFT JOIN colleges col ON p.college_id = col.id
      LEFT JOIN universities u ON col.university_id = u.id
      ${whereClause}
    `, values);

    return {
      materials: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    };
  },

  async listForAdmin(filters = {}) {
    let whereClause = 'WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      whereClause += ` AND m.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }
    if (filters.search) {
      whereClause += ` AND (m.title ILIKE $${paramCount} OR m.description ILIKE $${paramCount} OR upl.full_name ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }
    if (filters.courseId) {
      whereClause += ` AND m.course_id = $${paramCount}`;
      values.push(filters.courseId);
      paramCount++;
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const result = await query(`
      SELECT m.*, 
             c.name as course_name, c.code as course_code,
             p.name as program_name,
             u.name as university_name,
             mt.name as material_type_name,
             upl.full_name as uploader_name, upl.email as uploader_email,
             appr.full_name as approved_by_name
      FROM materials m
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN programs p ON c.program_id = p.id
      LEFT JOIN colleges col ON p.college_id = col.id
      LEFT JOIN universities u ON col.university_id = u.id
      LEFT JOIN material_types mt ON m.material_type_id = mt.id
      LEFT JOIN users upl ON m.uploader_id = upl.id
      LEFT JOIN users appr ON m.approved_by = appr.id
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...values, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) FROM materials m
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN programs p ON c.program_id = p.id
      LEFT JOIN colleges col ON p.college_id = col.id
      LEFT JOIN universities u ON col.university_id = u.id
      ${whereClause}
    `, values);

    return {
      materials: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    };
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['title', 'description', 'course_id', 'material_type_id', 'academic_year', 'semester', 'is_public'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramCount++}`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findById(id);
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(`
      UPDATE materials SET ${fields.join(', ')} WHERE id = $${paramCount}
      RETURNING *
    `, values);
    return result.rows[0];
  },

  async updateStatus(id, status, adminId, rejectionReason = null) {
    const approvedAt = status === 'approved' ? 'CURRENT_TIMESTAMP' : 'NULL';
    const result = await query(`
      UPDATE materials 
      SET status = $1, approved_by = $2, approved_at = ${approvedAt}, rejection_reason = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [status, adminId, rejectionReason, id]);
    return result.rows[0];
  },

  async incrementDownloadCount(id) {
    await query('UPDATE materials SET download_count = download_count + 1 WHERE id = $1', [id]);
  },

  async incrementViewCount(id) {
    await query('UPDATE materials SET view_count = view_count + 1 WHERE id = $1', [id]);
  },

  async updateRatingStats(id) {
    await query(`
      UPDATE materials SET 
        average_rating = (SELECT COALESCE(AVG(rating)::numeric(3,2), 0) FROM ratings WHERE material_id = $1),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE material_id = $1)
      WHERE id = $1
    `, [id]);
  },

  async delete(id) {
    await query('DELETE FROM materials WHERE id = $1', [id]);
  },

  async findByFileHash(fileHash) {
    const result = await query('SELECT * FROM materials WHERE file_hash = $1', [fileHash]);
    return result.rows[0];
  },

  async getUserUploads(userId, filters = {}) {
    let whereClause = 'WHERE m.uploader_id = $1';
    const values = [userId];
    let paramCount = 2;

    if (filters.status) {
      whereClause += ` AND m.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const result = await query(`
      SELECT m.*, 
             c.name as course_name, c.code as course_code,
             mt.name as material_type_name
      FROM materials m
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN material_types mt ON m.material_type_id = mt.id
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...values, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) FROM materials m ${whereClause}
    `, values);

    return {
      materials: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    };
  },

  async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_materials,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_materials,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_materials,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_materials,
        COALESCE(SUM(download_count), 0) as total_downloads
      FROM materials
    `);
    return result.rows[0];
  }
};