# Student Management System - Development Guide

## Project Overview

This is a complete full-stack student management application built with:
- **Frontend**: Next.js 14 with React and TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM (local), PostgreSQL (production)
- **Authentication**: NextAuth for secure login
- **Styling**: Tailwind CSS

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup Commands
```bash
# Install dependencies
npm install

# Initialize database
npm run db:init

# Start development server
npm run dev
```

Open http://localhost:3000 and login with:
- Email: `admin@example.com`
- Password: `password123`

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with SessionProvider
│   ├── page.tsx                   # Home page (redirects to dashboard)
│   ├── globals.css                # Global Tailwind styles
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth configuration
│   │   ├── students/              # Students CRUD API
│   │   ├── courses/               # Courses CRUD API
│   │   └── enrollments/           # Enrollments CRUD API
│   ├── auth/
│   │   ├── signin/                # Login page
│   │   └── error/                 # Auth error page
│   ├── dashboard/                 # Dashboard with statistics
│   ├── students/                  # Student management page
│   ├── courses/                   # Course management page
│   └── enrollments/               # Enrollment management page
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── db.ts                      # Prisma client singleton
│   └── seed.ts                    # Database seeding
└── components/                    # Reusable components (future)

prisma/
├── schema.prisma                  # Database schema
└── dev.db                         # SQLite database (generated)

.github/
└── copilot-instructions.md        # This file

Configuration Files:
- next.config.js                   # Next.js configuration
- tsconfig.json                    # TypeScript configuration
- tailwind.config.ts               # Tailwind CSS configuration
- vercel.json                      # Vercel deployment config
- .env.local                       # Environment variables
- .eslintrc.json                   # ESLint configuration
```

## Key Features

### 1. Authentication (src/lib/auth.ts)
- Credentials-based authentication with NextAuth
- Password hashing with bcryptjs
- JWT session tokens
- Protected API routes using getServerSession()

### 2. Database Models

#### User
- Stores admin/user accounts
- Password hashed with bcryptjs
- Role-based access control

#### Student
- Student information (name, email, contact, etc.)
- Academic details (major, enrollment year)
- Enrollment status tracking

#### Course
- Course information (code, title, credits)
- Semester tracking
- Course descriptions

#### Enrollment
- Links students to courses
- Tracks grades and enrollment status
- Maintains enrollment dates

### 3. API Routes

All API routes require authentication via NextAuth.

**GET/POST /api/students**
- Get all students or create new
- Validates unique email

**GET/POST /api/courses**
- Get all courses or create new
- Validates unique course code

**GET/POST /api/enrollments**
- Get all enrollments or create new
- Prevents duplicate enrollments

### 4. Frontend Pages

All pages require authentication (redirects to /auth/signin if not logged in).

- **/dashboard**: Main dashboard with statistics
- **/students**: Student management interface
- **/courses**: Course management interface
- **/enrollments**: Enrollment tracking

## Common Development Tasks

### Adding a New Page

1. Create file in `src/app/<name>/page.tsx`
2. Add "use client" directive for client-side features
3. Use `useSession()` hook for authentication
4. Fetch data from API routes
5. Add to navigation

Example:
```typescript
"use client"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function NewPage() {
  const { data: session, status } = useSession()
  
  if (status === "unauthenticated") {
    redirect("/auth/signin")
  }
  
  return <div>Content here</div>
}
```

### Adding an API Route

1. Create file in `src/app/api/<resource>/route.ts`
2. Use `getServerSession()` to verify authentication
3. Extract data from request
4. Use Prisma to query/modify database
5. Return JSON response

Example:
```typescript
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }
  
  const data = await prisma.model.findMany()
  return Response.json(data)
}
```

### Modifying Database Schema

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push`
3. Prisma will detect changes and apply them
4. Restart development server

### Creating Database Seed Data

Edit `src/lib/seed.ts` to add default data. Then run:
```bash
npm run db:seed
```

## Environment Variables

Create `.env.local` with:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-key>
DATABASE_URL=file:./prisma/dev.db
```

For production (Vercel):
```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<strong-random-key>
DATABASE_URL=postgresql://...
```

## Styling

- Uses Tailwind CSS utility classes
- Global styles in `src/app/globals.css`
- Responsive design with Tailwind breakpoints
- Color scheme: Blue/Indigo primary colors

Common utility classes:
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.card` - Card container
- `.input-field` - Form input
- `.nav-link` - Navigation links

## Testing Locally

### Test API Endpoints
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/students
```

### Test Forms
Navigate to pages and use the forms to add students/courses

### Common Issues
- **Port 3000 in use**: Run `npm run dev -- -p 3001`
- **NextAuth errors**: Check NEXTAUTH_URL and NEXTAUTH_SECRET
- **Database errors**: Delete `prisma/dev.db` and run `npm run db:init`

## Building for Production

```bash
npm run build
npm start
```

Production build optimizes:
- Code splitting
- Image optimization
- CSS minification
- JavaScript minification

## Deployment

### Local Development
```bash
npm run dev
```

### Vercel Deployment
See [VERCEL_DEPLOYMENT.md](../VERCEL_DEPLOYMENT.md) for detailed instructions.

Key steps:
1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy with one click

## Performance Optimization Tips

1. **Database Queries**: Use Prisma select() to fetch only needed fields
2. **API Caching**: Add revalidate options to fetch calls
3. **Image Optimization**: Use Next.js Image component
4. **Code Splitting**: Use dynamic imports for heavy components
5. **Database Indexing**: Add indexes to frequently queried fields

## Security Best Practices

1. ✅ Passwords hashed with bcryptjs
2. ✅ Authentication on all API routes
3. ✅ Environment secrets in .env.local/.env.production
4. ✅ Input validation on API routes
5. ✅ CSRF protection via NextAuth
6. ✅ Session-based authentication
7. ✅ No sensitive data in frontend code

## Troubleshooting Guide

| Issue | Solution |
|-------|----------|
| npm: command not found | Install Node.js from nodejs.org |
| git: command not found | Install Git from git-scm.com |
| Port 3000 in use | Run `npm run dev -- -p 3001` |
| NextAuth errors | Check NEXTAUTH_URL and NEXTAUTH_SECRET |
| Database errors | Delete dev.db and run `npm run db:init` |
| Build fails | Check TypeScript errors: `npx tsc --noEmit` |
| API 401 errors | Ensure user is logged in and session is valid |

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run lint                   # Check code quality

# Database
npm run db:push               # Sync schema changes
npm run db:generate           # Generate Prisma client
npm run db:seed               # Seed with sample data

# Build & Deploy
npm run build                 # Build for production
npm start                     # Run production server
vercel deploy                 # Deploy to Vercel
```

## File Size Guidelines

Keep generated files in mind:
- `.next/` directory: ~200-300 MB with node_modules
- Database: Starts small, grows with data
- Vercel has limits on function size (~50 MB)

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create pull request on GitHub
```

## Next Steps for Enhancement

Possible improvements:
1. [ ] Add export to CSV/PDF functionality
2. [ ] Implement role-based access control (RBAC)
3. [ ] Add student grade calculation
4. [ ] Implement email notifications
5. [ ] Add search and filter functionality
6. [ ] Create admin analytics dashboard
7. [ ] Implement student portal view
8. [ ] Add file uploads (transcripts, documents)
9. [ ] Implement audit logging
10. [ ] Add multi-language support

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Support & Contribution

For issues or questions:
1. Check existing GitHub issues
2. Review documentation files (README.md, INSTALLATION.md)
3. Check development logs: `vercel logs`

---

Last Updated: 2026-02-24
Version: 1.0.0
