import { UniversityModel, CollegeModel, ProgramModel, CourseModel } from '../models/AcademicStructure.js';
import { AppError } from '../middleware/errorHandler.js';

export const academicController = {
  // Universities
  async listUniversities(req, res, next) {
    try {
      const universities = await UniversityModel.findAll(req.query.activeOnly !== 'false');
      res.json({ universities });
    } catch (error) {
      next(error);
    }
  },

  async getUniversity(req, res, next) {
    try {
      const { id } = req.params;
      const university = await UniversityModel.findById(id);
      if (!university) {
        throw new AppError('University not found', 404, 'NOT_FOUND');
      }
      res.json({ university });
    } catch (error) {
      next(error);
    }
  },

  async createUniversity(req, res, next) {
    try {
      const university = await UniversityModel.create(req.body);
      res.status(201).json({ message: 'University created', university });
    } catch (error) {
      next(error);
    }
  },

  async updateUniversity(req, res, next) {
    try {
      const { id } = req.params;
      const university = await UniversityModel.update(id, req.body);
      if (!university) {
        throw new AppError('University not found', 404, 'NOT_FOUND');
      }
      res.json({ message: 'University updated', university });
    } catch (error) {
      next(error);
    }
  },

  async deleteUniversity(req, res, next) {
    try {
      const { id } = req.params;
      await UniversityModel.delete(id);
      res.json({ message: 'University deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Colleges
  async listColleges(req, res, next) {
    try {
      const { universityId } = req.params;
      const colleges = await CollegeModel.findByUniversity(universityId, req.query.activeOnly !== 'false');
      res.json({ colleges });
    } catch (error) {
      next(error);
    }
  },

  async getCollege(req, res, next) {
    try {
      const { id } = req.params;
      const college = await CollegeModel.findById(id);
      if (!college) {
        throw new AppError('College not found', 404, 'NOT_FOUND');
      }
      res.json({ college });
    } catch (error) {
      next(error);
    }
  },

  async createCollege(req, res, next) {
    try {
      const college = await CollegeModel.create(req.body);
      res.status(201).json({ message: 'College created', college });
    } catch (error) {
      next(error);
    }
  },

  async updateCollege(req, res, next) {
    try {
      const { id } = req.params;
      const college = await CollegeModel.update(id, req.body);
      if (!college) {
        throw new AppError('College not found', 404, 'NOT_FOUND');
      }
      res.json({ message: 'College updated', college });
    } catch (error) {
      next(error);
    }
  },

  async deleteCollege(req, res, next) {
    try {
      const { id } = req.params;
      await CollegeModel.delete(id);
      res.json({ message: 'College deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Programs
  async listPrograms(req, res, next) {
    try {
      const { collegeId } = req.params;
      const programs = await ProgramModel.findByCollege(collegeId, req.query.activeOnly !== 'false');
      res.json({ programs });
    } catch (error) {
      next(error);
    }
  },

  async listAllPrograms(req, res, next) {
    try {
      const programs = await ProgramModel.findAllWithRelations(req.query.activeOnly !== 'false');
      res.json({ programs });
    } catch (error) {
      next(error);
    }
  },

  async getProgram(req, res, next) {
    try {
      const { id } = req.params;
      const program = await ProgramModel.findById(id);
      if (!program) {
        throw new AppError('Program not found', 404, 'NOT_FOUND');
      }
      res.json({ program });
    } catch (error) {
      next(error);
    }
  },

  async createProgram(req, res, next) {
    try {
      const program = await ProgramModel.create(req.body);
      res.status(201).json({ message: 'Program created', program });
    } catch (error) {
      next(error);
    }
  },

  async updateProgram(req, res, next) {
    try {
      const { id } = req.params;
      const program = await ProgramModel.update(id, req.body);
      if (!program) {
        throw new AppError('Program not found', 404, 'NOT_FOUND');
      }
      res.json({ message: 'Program updated', program });
    } catch (error) {
      next(error);
    }
  },

  async deleteProgram(req, res, next) {
    try {
      const { id } = req.params;
      await ProgramModel.delete(id);
      res.json({ message: 'Program deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Courses
  async listCourses(req, res, next) {
    try {
      const { programId } = req.params;
      const courses = await CourseModel.findByProgram(programId, req.query.activeOnly !== 'false');
      res.json({ courses });
    } catch (error) {
      next(error);
    }
  },

  async listCoursesByYearSemester(req, res, next) {
    try {
      const { programId } = req.params;
      const { year, semester } = req.query;
      if (!year || !semester) {
        throw new AppError('Year and semester are required', 400, 'MISSING_PARAMS');
      }
      const courses = await CourseModel.findByProgramYearSemester(programId, parseInt(year), parseInt(semester));
      res.json({ courses });
    } catch (error) {
      next(error);
    }
  },

  async getCourse(req, res, next) {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);
      if (!course) {
        throw new AppError('Course not found', 404, 'NOT_FOUND');
      }
      res.json({ course });
    } catch (error) {
      next(error);
    }
  },

  async createCourse(req, res, next) {
    try {
      const course = await CourseModel.create(req.body);
      res.status(201).json({ message: 'Course created', course });
    } catch (error) {
      next(error);
    }
  },

  async updateCourse(req, res, next) {
    try {
      const { id } = req.params;
      const course = await CourseModel.update(id, req.body);
      if (!course) {
        throw new AppError('Course not found', 404, 'NOT_FOUND');
      }
      res.json({ message: 'Course updated', course });
    } catch (error) {
      next(error);
    }
  },

  async deleteCourse(req, res, next) {
    try {
      const { id } = req.params;
      await CourseModel.delete(id);
      res.json({ message: 'Course deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Full hierarchy
  async getHierarchy(req, res, next) {
    try {
      const universities = await UniversityModel.findAll(true);
      const hierarchy = [];

      for (const uni of universities) {
        const colleges = await CollegeModel.findByUniversity(uni.id, true);
        const uniData = { ...uni, colleges: [] };

        for (const college of colleges) {
          const programs = await ProgramModel.findByCollege(college.id, true);
          const collegeData = { ...college, programs: [] };

          for (const program of programs) {
            const courses = await CourseModel.findByProgram(program.id, true);
            collegeData.programs.push({ ...program, courses });
          }

          uniData.colleges.push(collegeData);
        }

        hierarchy.push(uniData);
      }

      res.json({ hierarchy });
    } catch (error) {
      next(error);
    }
  }
};