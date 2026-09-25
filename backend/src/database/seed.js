import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if already seeded
    const existing = await client.query('SELECT COUNT(*) FROM universities');
    if (parseInt(existing.rows[0].count) > 0) {
      console.log('Database already seeded, skipping...');
      await client.query('COMMIT');
      return;
    }

    // Insert University of Dodoma
    const uniResult = await client.query(`
      INSERT INTO universities (name, code, description)
      VALUES ('University of Dodoma', 'UDOM', 'The University of Dodoma is a public university in Dodoma, Tanzania.')
      RETURNING id
    `);
    const udomId = uniResult.rows[0].id;

    // Insert colleges
    const colleges = [
      { name: 'College of Informatics and Virtual Education', code: 'CIVE' },
      { name: 'College of Natural and Mathematical Sciences', code: 'CNMS' },
      { name: 'College of Humanities and Social Sciences', code: 'CHSS' },
      { name: 'College of Business Studies and Law', code: 'CBSL' },
      { name: 'College of Education', code: 'COED' },
      { name: 'College of Health and Allied Sciences', code: 'CHAS' },
      { name: 'College of Earth Sciences', code: 'CES' },
    ];

    const collegeIds = {};
    for (const college of colleges) {
      const result = await client.query(`
        INSERT INTO colleges (university_id, name, code)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [udomId, college.name, college.code]);
      collegeIds[college.code] = result.rows[0].id;
    }

    // Insert programs
    const programs = [
      { college: 'CIVE', name: 'BSc Computer Science', code: 'BSCS', duration: 3 },
      { college: 'CIVE', name: 'BSc Information Technology', code: 'BSIT', duration: 3 },
      { college: 'CIVE', name: 'BSc Software Engineering', code: 'BSSE', duration: 3 },
      { college: 'CIVE', name: 'BSc Computer Engineering', code: 'BSCE', duration: 4 },
      { college: 'CNMS', name: 'BSc Mathematics', code: 'BSMA', duration: 3 },
      { college: 'CNMS', name: 'BSc Physics', code: 'BSPH', duration: 3 },
      { college: 'CNMS', name: 'BSc Chemistry', code: 'BSCH', duration: 3 },
      { college: 'CNMS', name: 'BSc Biology', code: 'BSBI', duration: 3 },
      { college: 'CHSS', name: 'BA Sociology', code: 'BASO', duration: 3 },
      { college: 'CHSS', name: 'BA Psychology', code: 'BAPS', duration: 3 },
      { college: 'CBSL', name: 'BBA Accounting', code: 'BBAC', duration: 3 },
      { college: 'CBSL', name: 'BBA Finance', code: 'BBAF', duration: 3 },
      { college: 'CBSL', name: 'LLB Law', code: 'LLB', duration: 4 },
    ];

    const programIds = {};
    for (const prog of programs) {
      const result = await client.query(`
        INSERT INTO programs (college_id, name, code, duration_years)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [collegeIds[prog.college], prog.name, prog.code, prog.duration]);
      programIds[prog.code] = result.rows[0].id;
    }

    // Insert material types
    const materialTypes = [
      { name: 'Lecture Notes', icon: 'file-text' },
      { name: 'Past Examination', icon: 'file-question' },
      { name: 'Assignment', icon: 'file-check' },
      { name: 'Tutorial', icon: 'book' },
      { name: 'Lab Report', icon: 'flask-conical' },
      { name: 'Presentation', icon: 'presentation' },
      { name: 'Thesis/Dissertation', icon: 'graduation-cap' },
      { name: 'Other', icon: 'file' },
    ];

    const typeIds = {};
    for (const type of materialTypes) {
      const result = await client.query(`
        INSERT INTO material_types (name, icon)
        VALUES ($1, $2)
        RETURNING id
      `, [type.name, type.icon]);
      typeIds[type.name] = result.rows[0].id;
    }

    // Insert sample courses for BSc Computer Science
    const csProgramId = programIds['BSCS'];
    const csCourses = [
      { name: 'Introduction to Computer Science', code: 'CSC 101', year: 1, semester: 1, credits: 3 },
      { name: 'Programming Fundamentals', code: 'CSC 102', year: 1, semester: 1, credits: 3 },
      { name: 'Discrete Mathematics', code: 'CSC 103', year: 1, semester: 1, credits: 3 },
      { name: 'Computer Architecture', code: 'CSC 104', year: 1, semester: 2, credits: 3 },
      { name: 'Data Structures and Algorithms', code: 'CSC 201', year: 2, semester: 1, credits: 3 },
      { name: 'Object Oriented Programming', code: 'CSC 202', year: 2, semester: 1, credits: 3 },
      { name: 'Database Systems', code: 'CSC 203', year: 2, semester: 1, credits: 3 },
      { name: 'Operating Systems', code: 'CSC 204', year: 2, semester: 2, credits: 3 },
      { name: 'Computer Networks', code: 'CSC 301', year: 3, semester: 1, credits: 3 },
      { name: 'Software Engineering', code: 'CSC 302', year: 3, semester: 1, credits: 3 },
      { name: 'Web Technologies', code: 'CSC 303', year: 3, semester: 1, credits: 3 },
      { name: 'Artificial Intelligence', code: 'CSC 304', year: 3, semester: 2, credits: 3 },
      { name: 'Machine Learning', code: 'CSC 401', year: 4, semester: 1, credits: 3 },
      { name: 'Distributed Systems', code: 'CSC 402', year: 4, semester: 1, credits: 3 },
      { name: 'Final Year Project', code: 'CSC 403', year: 4, semester: 2, credits: 6 },
    ];

    for (const course of csCourses) {
      await client.query(`
        INSERT INTO courses (program_id, name, code, year, semester, credits)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [csProgramId, course.name, course.code, course.year, course.semester, course.credits]);
    }

    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, university_id, program_id, year_of_study, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, ['admin@udom.ac.tz', adminPasswordHash, 'System Administrator', 'admin', udomId, csProgramId, 1, true]);

    // Create test student
    const studentPasswordHash = await bcrypt.hash('student123', 12);
    await client.query(`
      INSERT INTO users (email, password_hash, full_name, student_number, role, university_id, program_id, year_of_study, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, ['student@udom.ac.tz', studentPasswordHash, 'John Student', 'STU/2024/001', 'student', udomId, csProgramId, 2, true]);

    await client.query('COMMIT');
    console.log('Database seeded successfully');
    console.log('Admin: admin@udom.ac.tz / admin123');
    console.log('Student: student@udom.ac.tz / student123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));