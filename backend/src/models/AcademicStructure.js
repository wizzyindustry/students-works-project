import { query } from '../config/database.js';

export const UniversityModel = {
  async create(data) {
    const result = await query(`
      INSERT INTO universities (name, code, description, logo_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [data.name, data.code, data.description, data.logoUrl]);
    return result.rows[0];
  },

  async findAll(activeOnly = true) {
    const where = activeOnly ? 'WHERE is_active = true' : '';
    const result = await query(`SELECT * FROM universities ${where} ORDER BY name`);
    return result.rows;
  },

  async findById(id) {
    const result = await query('SELECT * FROM universities WHERE id = $1', [id]);
    return result.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'code', 'description', 'logo_url', 'is_active'];
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
      UPDATE universities SET ${fields.join(', ')} WHERE id = $${paramCount}
      RETURNING *
    `, values);
    return result.rows[0];
  },

  async delete(id) {
    await query('DELETE FROM universities WHERE id = $1', [id]);
  }
};

export const CollegeModel = {
  async create(data) {
    const result = await query(`
      INSERT INTO colleges (university_id, name, code, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [data.universityId, data.name, data.code, data.description]);
    return result.rows[0];
  },

  async findByUniversity(universityId, activeOnly = true) {
    const where = activeOnly ? 'AND is_active = true' : '';
    const result = await query(`
      SELECT * FROM colleges WHERE university_id = $1 ${where} ORDER BY name
    `, [universityId]);
    return result.rows;
  },

  async findById(id) {
    const result = await query('SELECT * FROM colleges WHERE id = $1', [id]);
    return result.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'code', 'description', 'is_active'];
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
      UPDATE colleges SET ${fields.join(', ')} WHERE id = $${paramCount}
      RETURNING *
    `, values);
    return result.rows[0];
  },

  async delete(id) {
    await query('DELETE FROM colleges WHERE id = $1', [id]);
  }
};

export const ProgramModel = {
  async create(data) {
    const result = await query(`
      INSERT INTO programs (college_id, name, code, description, duration_years)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [data.collegeId, data.name, data.code, data.description, data.durationYears || 3]);
    return result.rows[0];
  },

  async findByCollege(collegeId, activeOnly = true) {
    const where = activeOnly ? 'AND is_active = true' : '';
    const result = await query(`
      SELECT * FROM programs WHERE college_id = $1 ${where} ORDER BY name
    `, [collegeId]);
    return result.rows;
  },

  async findById(id) {
    const result = await query(`
      SELECT p.*, c.name as college_name, c.university_id
      FROM programs p
      LEFT JOIN colleges c ON p.college_id = c.id
      WHERE p.id = $1
    `, [id]);
    return result.rows[0];
  },

  async findAllWithRelations(activeOnly = true) {
    const where = activeOnly ? 'WHERE p.is_active = true AND c.is_active = true AND u.is_active = true' : '';
    const result = await query(`
      SELECT p.*, c.name as college_name, c.code as college_code,
             u.name as university_name, u.code as university_code
      FROM programs p
      LEFT JOIN colleges c ON p.college_id = c.id
      LEFT JOIN universities u ON c.university_id = u.id
      ${where}
      ORDER BY u.name, c.name, p.name
    `);
    return result.rows;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'code', 'description', 'duration_years', 'is_active'];
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
      UPDATE programs SET ${fields.join(', ')} WHERE id = $${paramCount}
      RETURNING *
    `, values);
    return result.rows[0];
  },

  async delete(id) {
    await query('DELETE FROM programs WHERE id = $1', [id]);
  }
};

export const CourseModel = {
  async create(data) {
    const result = await query(`
      INSERT INTO courses (program_id, name, code, description, year, semester, credits)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [data.programId, data.name, data.code, data.description, data.year, data.semester, data.credits || 3]);
    return result.rows[0];
  },

  async findByProgram(programId, activeOnly = true) {
    const where = activeOnly ? 'AND is_active = true' : '';
    const result = await query(`
      SELECT * FROM courses WHERE program_id = $1 ${where} ORDER BY year, semester, name
    `, [programId]);
    return result.rows;
  },

  async findById(id) {
    const result = await query(`
      SELECT c.*, p.name as program_name, p.code as program_code,
             col.name as college_name, u.name as university_name
      FROM courses c
      LEFT JOIN programs p ON c.program_id = p.id
      LEFT JOIN colleges col ON p.college_id = col.id
      LEFT JOIN universities u ON col.university_id = u.id
      WHERE c.id = $1
    `, [id]);
    return result.rows[0];
  },

  async findByProgramYearSemester(programId, year, semester) {
    const result = await query(`
      SELECT * FROM courses 
      WHERE program_id = $1 AND year = $2 AND semester = $3 AND is_active = true
      ORDER BY name
    `, [programId, year, semester]);
    return result.rows;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'code', 'description', 'year', 'semester', 'credits', 'is_active'];
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
      UPDATE courses SET ${fields.join(', ')} WHERE id = $${paramCount}
      RETURNING *
    `, values);
    return result.rows[0];
  },

  async delete(id) {
    await query('DELETE FROM courses WHERE id = $1', [id]);
  }
};