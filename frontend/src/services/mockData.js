// High-fidelity fallback / demo data when backend or database is offline
export const MOCK_UNIVERSITIES = [
  {
    id: 'u-1',
    name: 'University of Dodoma (UDOM)',
    code: 'UDOM',
    description: 'Premier public university located in the capital city of Dodoma, Tanzania.',
    colleges: [
      {
        id: 'c-1',
        name: 'College of Informatics and Virtual Education (CIVE)',
        code: 'CIVE',
        programs: [
          {
            id: 'p-1',
            name: 'BSc in Computer Science',
            code: 'BCS',
            durationYears: 3,
            courses: [
              { id: 'crs-1', code: 'CS111', name: 'Introduction to Programming & Problem Solving', year: 1, semester: 1, credits: 10 },
              { id: 'crs-2', code: 'CS112', name: 'Discrete Mathematics for Computing', year: 1, semester: 1, credits: 8 },
              { id: 'crs-3', code: 'CS121', name: 'Object-Oriented Programming (Java)', year: 1, semester: 2, credits: 10 },
              { id: 'crs-4', code: 'CS211', name: 'Data Structures and Algorithms', year: 2, semester: 1, credits: 12 },
              { id: 'crs-5', code: 'CS212', name: 'Database Management Systems', year: 2, semester: 1, credits: 10 },
              { id: 'crs-6', code: 'CS221', name: 'Computer Networks & Security', year: 2, semester: 2, credits: 10 },
              { id: 'crs-7', code: 'CS311', name: 'Software Engineering Principles', year: 3, semester: 1, credits: 12 },
              { id: 'crs-8', code: 'CS321', name: 'Artificial Intelligence & Machine Learning', year: 3, semester: 2, credits: 12 }
            ]
          },
          {
            id: 'p-2',
            name: 'BSc in Software Engineering',
            code: 'BSE',
            durationYears: 4,
            courses: [
              { id: 'crs-9', code: 'SE111', name: 'Foundations of Software Engineering', year: 1, semester: 1, credits: 10 },
              { id: 'crs-10', code: 'SE211', name: 'Software Architecture & Design Patterns', year: 2, semester: 1, credits: 10 }
            ]
          }
        ]
      },
      {
        id: 'c-2',
        name: 'College of Natural and Mathematical Sciences (CNMS)',
        code: 'CNMS',
        programs: [
          {
            id: 'p-3',
            name: 'BSc in Mathematics and Statistics',
            code: 'BMS',
            durationYears: 3,
            courses: [
              { id: 'crs-11', code: 'MT101', name: 'Calculus I & Linear Algebra', year: 1, semester: 1, credits: 12 },
              { id: 'crs-12', code: 'ST201', name: 'Probability Theory and Mathematical Statistics', year: 2, semester: 1, credits: 10 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'u-2',
    name: 'University of Dar es Salaam (UDSM)',
    code: 'UDSM',
    description: 'The oldest and largest public university in Tanzania.',
    colleges: [
      {
        id: 'c-3',
        name: 'College of Information and Communication Technologies (CoICT)',
        code: 'CoICT',
        programs: [
          {
            id: 'p-4',
            name: 'BSc in Computer Engineering and IT',
            code: 'BCEIT',
            durationYears: 4,
            courses: [
              { id: 'crs-13', code: 'IS242', name: 'Web Technologies and Cloud Systems', year: 2, semester: 2, credits: 10 }
            ]
          }
        ]
      }
    ]
  }
];

export const MOCK_MATERIAL_TYPES = [
  { id: 'mt-1', name: 'Lecture Notes', slug: 'lecture-notes', icon: 'file-text' },
  { id: 'mt-2', name: 'Past Exam', slug: 'past-exam', icon: 'award' },
  { id: 'mt-3', name: 'Assignment Solution', slug: 'assignment', icon: 'check-square' },
  { id: 'mt-4', name: 'Tutorial Sheet', slug: 'tutorial', icon: 'help-circle' },
  { id: 'mt-5', name: 'Lab Manual', slug: 'lab-manual', icon: 'terminal' },
  { id: 'mt-6', name: 'Textbook / Summary', slug: 'summary', icon: 'book-open' }
];

export const MOCK_MATERIALS = [
  {
    id: 'mat-1',
    title: 'CS211: Complete Data Structures & Algorithms Handout with Code Examples',
    description: 'Comprehensive study guide covering arrays, linked lists, trees, graphs, sorting, and dynamic programming with Java & Python code snippets.',
    fileSize: 4850230,
    formattedSize: '4.6 MB',
    mimeType: 'application/pdf',
    fileName: 'CS211_Complete_DSA_Guide.pdf',
    academicYear: '2024-2025',
    semester: 1,
    status: 'approved',
    downloadCount: 384,
    averageRating: 4.8,
    ratingsCount: 42,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    course: { id: 'crs-4', code: 'CS211', name: 'Data Structures and Algorithms' },
    program: { id: 'p-1', code: 'BCS', name: 'BSc in Computer Science' },
    university: { id: 'u-1', code: 'UDOM', name: 'University of Dodoma' },
    materialType: { id: 'mt-1', name: 'Lecture Notes', icon: 'file-text' },
    uploader: { id: 'usr-student', fullName: 'Kelvin Mushi', role: 'student' }
  },
  {
    id: 'mat-2',
    title: 'CS212: Database Systems End of Semester Exam 2023/2024 with Marking Guide',
    description: 'Official university examination paper covering relational algebra, SQL complex queries, B+ Trees indexing, and normal forms up to BCNF.',
    fileSize: 2150000,
    formattedSize: '2.1 MB',
    mimeType: 'application/pdf',
    fileName: 'CS212_Final_Exam_2024.pdf',
    academicYear: '2023-2024',
    semester: 1,
    status: 'approved',
    downloadCount: 512,
    averageRating: 4.9,
    ratingsCount: 68,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    course: { id: 'crs-5', code: 'CS212', name: 'Database Management Systems' },
    program: { id: 'p-1', code: 'BCS', name: 'BSc in Computer Science' },
    university: { id: 'u-1', code: 'UDOM', name: 'University of Dodoma' },
    materialType: { id: 'mt-2', name: 'Past Exam', icon: 'award' },
    uploader: { id: 'usr-admin', fullName: 'Dr. Neema Mwamba', role: 'admin' }
  },
  {
    id: 'mat-3',
    title: 'CS111: Introduction to Programming Python Cheatsheet and Lab Solutions',
    description: 'Concise reference notes for Python syntax, control structures, list comprehensions, dictionary operations, file I/O, and error handling.',
    fileSize: 1250300,
    formattedSize: '1.2 MB',
    mimeType: 'application/pdf',
    fileName: 'CS111_Python_Lab_Cheatsheet.pdf',
    academicYear: '2024-2025',
    semester: 1,
    status: 'approved',
    downloadCount: 229,
    averageRating: 4.7,
    ratingsCount: 31,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    course: { id: 'crs-1', code: 'CS111', name: 'Introduction to Programming & Problem Solving' },
    program: { id: 'p-1', code: 'BCS', name: 'BSc in Computer Science' },
    university: { id: 'u-1', code: 'UDOM', name: 'University of Dodoma' },
    materialType: { id: 'mt-5', name: 'Lab Manual', icon: 'terminal' },
    uploader: { id: 'usr-student', fullName: 'Kelvin Mushi', role: 'student' }
  },
  {
    id: 'mat-4',
    title: 'CS311: Software Engineering UML Diagrams and Design Patterns Guide',
    description: 'Detailed analysis of Creational, Structural, and Behavioral Gang-of-Four design patterns with practical case studies.',
    fileSize: 3400000,
    formattedSize: '3.4 MB',
    mimeType: 'application/pdf',
    fileName: 'CS311_Design_Patterns_Handbook.pdf',
    academicYear: '2024-2025',
    semester: 1,
    status: 'pending',
    downloadCount: 0,
    averageRating: 0,
    ratingsCount: 0,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    course: { id: 'crs-7', code: 'CS311', name: 'Software Engineering Principles' },
    program: { id: 'p-1', code: 'BCS', name: 'BSc in Computer Science' },
    university: { id: 'u-1', code: 'UDOM', name: 'University of Dodoma' },
    materialType: { id: 'mt-1', name: 'Lecture Notes', icon: 'file-text' },
    uploader: { id: 'usr-student', fullName: 'Baraka John', role: 'student' }
  },
  {
    id: 'mat-5',
    title: 'MT101: Calculus I Solved Midterm Problems & Step-by-Step Derivations',
    description: 'Complete worked solutions for limits, continuity, implicit differentiation, optimization problems, and curve sketching.',
    fileSize: 5800000,
    formattedSize: '5.5 MB',
    mimeType: 'application/pdf',
    fileName: 'MT101_Calculus_Worked_Solutions.pdf',
    academicYear: '2024-2025',
    semester: 1,
    status: 'approved',
    downloadCount: 418,
    averageRating: 4.6,
    ratingsCount: 52,
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    course: { id: 'crs-11', code: 'MT101', name: 'Calculus I & Linear Algebra' },
    program: { id: 'p-3', code: 'BMS', name: 'BSc in Mathematics and Statistics' },
    university: { id: 'u-1', code: 'UDOM', name: 'University of Dodoma' },
    materialType: { id: 'mt-4', name: 'Tutorial Sheet', icon: 'help-circle' },
    uploader: { id: 'usr-student-2', fullName: 'Sarah Makonda', role: 'student' }
  }
];

export const MOCK_USERS = [
  {
    id: 'usr-admin',
    fullName: 'System Administrator',
    email: 'admin@udom.ac.tz',
    role: 'admin',
    isActive: true,
    isSuspended: false,
    studentNumber: 'ADM/2022/001',
    universityName: 'University of Dodoma (UDOM)',
    programName: 'BSc in Computer Science',
    collegeName: 'College of Informatics and Virtual Education',
    yearOfStudy: 4,
    lastLogin: new Date().toISOString()
  },
  {
    id: 'usr-student',
    fullName: 'Kelvin Mushi',
    email: 'student@udom.ac.tz',
    role: 'student',
    isActive: true,
    isSuspended: false,
    studentNumber: 'T21-03-04921',
    universityName: 'University of Dodoma (UDOM)',
    programName: 'BSc in Computer Science',
    collegeName: 'College of Informatics and Virtual Education',
    yearOfStudy: 3,
    lastLogin: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'usr-student-2',
    fullName: 'Sarah Makonda',
    email: 'sarah@udom.ac.tz',
    role: 'student',
    isActive: true,
    isSuspended: false,
    studentNumber: 'T22-03-01822',
    universityName: 'University of Dodoma (UDOM)',
    programName: 'BSc in Mathematics and Statistics',
    collegeName: 'College of Natural and Mathematical Sciences',
    yearOfStudy: 2,
    lastLogin: new Date(Date.now() - 86400000).toISOString()
  }
];

export const MOCK_REPORTS = [
  {
    id: 'rep-1',
    materialId: 'mat-1',
    materialTitle: 'CS211: Complete Data Structures & Algorithms Handout',
    reporterName: 'David Lyimo',
    reporterEmail: 'david@udom.ac.tz',
    reason: 'inappropriate',
    description: 'Page 14 contains incorrect time complexity derivations for QuickSort partition step.',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'rep-2',
    materialId: 'mat-3',
    materialTitle: 'CS111: Python Cheatsheet',
    reporterName: 'Amina Kassim',
    reporterEmail: 'amina@udom.ac.tz',
    reason: 'copyright',
    description: 'This is an exact reproduction of textbook chapter 4 exercises without citation.',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];
