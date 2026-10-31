# Student Academic Materials Sharing Platform

A web-based platform for university students to share, discover, and download academic materials such as lecture notes, past examinations, assignments, and tutorials.

## Features

- **User Authentication**: Secure registration, login, password reset with JWT tokens
- **Academic Hierarchy**: Materials organized by University → College → Program → Year → Semester → Course
- **Material Management**: Upload, search, filter, download, rate, report, bookmark
- **Admin Dashboard**: Manage users, materials, reports, academic structure
- **File Upload**: Support for PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, Images, ZIP with compression
- **Security**: bcrypt password hashing, rate limiting, input validation, HTTPS enforcement
- **Responsive Design**: Mobile-first, accessible UI with Bootstrap 5

## Tech Stack

- **Frontend**: React 19, Vite, React Router DOM 7, Lucide Icons, Modern Glassmorphism CSS Design System
- **Backend**: Node.js, Express.js (REST API on port 5000 with `/api` proxy)
- **Database**: PostgreSQL (Supabase / Local)
- **File Storage**: Local filesystem (configurable for cloud)
- **Deployment**: Docker, nginx

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone and install dependencies**

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials

# Frontend
cd ../frontend
npm install
```

2. **Set up database**

```bash
# Create database
createdb student_materials

# Run migrations
cd ../backend
npm run db:migrate

# Seed initial data
npm run db:seed
```

3. **Start development servers**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

4. **Access the application**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Health check: http://localhost:3000/api/health

### Demo Accounts

After seeding:
- **Admin**: admin@udom.ac.tz / admin123
- **Student**: student@udom.ac.tz / student123

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Project Structure

```
student-materials/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, environment config
│   │   ├── controllers/    # Route handlers
│   │   ├── database/       # Migrations, seeds
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # File upload, helpers
│   │   ├── validators/     # Input validation schemas
│   │   └── app.js          # Express app entry
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── public/             # Static assets (robots.txt, sitemap.xml, etc.)
│   ├── src/
│   │   ├── assets/         # CSS, JS, images
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   └── utils/          # API, auth, storage, toast, modal
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Materials
- `GET /api/materials` - List materials (with filters)
- `GET /api/materials/:id` - Get material details
- `POST /api/materials` - Upload material
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material
- `POST /api/materials/:id/download` - Download material
- `GET /api/materials/my-uploads` - Get user's uploads

### Academic Structure
- `GET /api/academic/hierarchy` - Full hierarchy
- `GET /api/academic/universities` - List universities
- `GET /api/academic/universities/:id/colleges` - List colleges
- `GET /api/academic/colleges/:id/programs` - List programs
- `GET /api/academic/programs/:id/courses` - List courses

### Interactions
- `POST /api/interactions/materials/:id/rate` - Rate material
- `POST /api/interactions/materials/:id/report` - Report material
- `POST /api/interactions/materials/:id/bookmark` - Toggle bookmark
- `GET /api/interactions/bookmarks` - Get bookmarks
- `GET /api/interactions/downloads` - Get download history

### Admin
- `GET /api/admin/dashboard` - Statistics
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id` - Update user
- `PUT /api/admin/users/:id/suspend` - Suspend/unsuspend
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/materials` - All materials
- `PUT /api/admin/materials/:id/approve` - Approve/reject
- `DELETE /api/admin/materials/:id` - Delete material
- `GET /api/admin/reports` - List reports
- `PUT /api/admin/reports/:id/status` - Update report status

## Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_materials
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret
BCRYPT_ROUNDS=12

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=application/pdf,application/msword,...

FORCE_HTTPS=false
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=Student Materials Platform
```

## Security Considerations

- All passwords hashed with bcrypt (12 rounds)
- JWT tokens with short expiry (7d access, 30d refresh)
- Secure, HTTP-only cookies in production
- Rate limiting on auth endpoints (10 req/15min)
- Input validation on all endpoints
- Helmet.js for security headers
- CORS configured for frontend domain only
- File type and size validation
- SQL injection protection via parameterized queries
- XSS protection via input sanitization

## Performance Optimizations

- Compression middleware (gzip)
- Database indexes on frequently queried columns
- Pagination on all list endpoints
- Image compression on upload (WebP, 80% quality)
- Static asset caching (1 year)
- Code splitting with Vite
- Terser minification for production

## Accessibility

- Semantic HTML5
- ARIA labels and roles
- Keyboard navigation support
- Focus management in modals
- Color contrast compliance
- Reduced motion support
- Screen reader friendly

## License

MIT License - feel free to use for educational purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request