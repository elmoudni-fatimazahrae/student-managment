# Student Management System

A complete full-stack student management application built with Next.js 14, SQLite, and NextAuth.

## Features

- **Student Management**: Add, view, and manage student information
- **Course Management**: Create and manage courses with credits and semester information
- **Enrollment Management**: Track student enrollments in courses
- **Authentication**: Secure login with NextAuth and credential-based authentication
- **Database**: SQLite database with Prisma ORM
- **Dashboard**: Overview of system statistics and quick actions
- **Responsive UI**: Built with Tailwind CSS for modern, responsive design

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth 4
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

3. Initialize the database with a default admin user:
```bash
npx prisma db seed
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Credentials

- **Email**: admin@example.com
- **Password**: password123

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth configuration
│   │   ├── students/           # Students API routes
│   │   ├── courses/            # Courses API routes
│   │   └── enrollments/        # Enrollments API routes
│   ├── auth/
│   │   ├── signin/             # Sign in page
│   │   └── error/              # Auth error page
│   ├── dashboard/              # Dashboard page
│   ├── students/               # Students management page
│   ├── courses/                # Courses management page
│   └── enrollments/            # Enrollments management page
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   └── db.ts                   # Prisma client
└── components/                 # Reusable components

prisma/
├── schema.prisma               # Database schema
└── dev.db                      # SQLite database (generated)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database migrations
- `npm run db:generate` - Generate Prisma client

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create a new student

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create a new course

### Enrollments
- `GET /api/enrollments` - Get all enrollments
- `POST /api/enrollments` - Create a new enrollment

All endpoints require authentication.

## Environment Variables

Create a `.env.local` file in the root directory:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-secret-key
DATABASE_URL=file:./prisma/dev.db
```

## Deployment to Vercel

### Prerequisites
- GitHub account with the repository linked
- Vercel account

### Steps

1. Connect your GitHub repository to Vercel
2. Import the project in Vercel dashboard
3. Add environment variables in Vercel settings:
   - `NEXTAUTH_URL` - Your production URL
   - `NEXTAUTH_SECRET` - A secure random string
   - `DATABASE_URL` - SQLite file path

4. Deploy by pushing to main branch

The project includes a `vercel.json` configuration for optimal Vercel deployment.

## Database Schema

### Users
- `id` - Primary key
- `email` - Unique email address
- `name` - Full name
- `password` - Hashed password
- `role` - User role (admin, user)
- `createdAt`, `updatedAt` - Timestamps

### Students
- `id` - Primary key
- `email`, `firstName`, `lastName` - Basic info
- `phone`, `address`, `city`, `zipCode` - Contact info
- `dateOfBirth`, `enrollmentYear`, `major` - Academic info
- `status` - Active/Inactive status
- `createdAt`, `updatedAt` - Timestamps

### Courses
- `id` - Primary key
- `code`, `title`, `description` - Course info
- `credits`, `semester` - Academic details
- `createdAt`, `updatedAt` - Timestamps

### Enrollments
- `id` - Primary key
- `studentId`, `courseId` - Foreign keys
- `grade` - Student's grade
- `status` - Enrollment status (active/completed/dropped)
- `enrollmentDate` - When enrolled
- `createdAt`, `updatedAt` - Timestamps

## Security

- Passwords are hashed with bcryptjs
- Authentication uses NextAuth with JWT
- API routes require active session
- Environment secrets are never exposed
- CSRF protection included with NextAuth

## License

MIT - Free to use and modify

## Support

For issues or questions, please create an issue in the GitHub repository.
