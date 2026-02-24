# Deployment Checklist

This checklist guides you through the complete deployment process for the Student Management System.

## Prerequisites Checklist

- [ ] Node.js 18+ installed and working
- [ ] npm installed and working  
- [ ] Git installed and configured
- [ ] GitHub account created
- [ ] Vercel account created (optional but recommended)
- [ ] Docker installed (if using Docker deployment)

Verify with:
```bash
node --version    # Should be 18+
npm --version     # Should be 8+
git --version     # Should be 2.40+
```

## Local Development Setup

- [ ] Navigate to project directory: `cd C:\Users\PC\Documents\app`
- [ ] Install dependencies: `npm install`
- [ ] Initialize database: `npm run db:init`
- [ ] Start dev server: `npm run dev`
- [ ] Access application: Open http://localhost:3000
- [ ] Test login with:
  - Email: `admin@example.com`
  - Password: `password123`
- [ ] Verify all pages load correctly:
  - [ ] Dashboard
  - [ ] Students page
  - [ ] Courses page
  - [ ] Enrollments page
- [ ] Test functionality:
  - [ ] Add a new student
  - [ ] Add a new course
  - [ ] Create an enrollment
  - [ ] View statistics on dashboard

## GitHub Repository Setup

### Step 1: Create Repository on GitHub

- [ ] Go to https://github.com/new
- [ ] Repository name: `student-managment`
- [ ] Description: `Complete student management system with Next.js, SQLite, and NextAuth`
- [ ] Visibility: Public (or Private if preferred)
- [ ] Click "Create repository"
- [ ] Copy the repository URL

### Step 2: Initialize Git Locally

```bash
cd C:\Users\PC\Documents\app
git init
git config user.email "f.elmoudni@esisa.ac.ma"
git config user.name "Student Management"
git add .
git commit -m "Initial commit: Complete student management system with Next.js, SQLite, and NextAuth"
```

Checklist:
- [ ] `git init` executed
- [ ] User email configured
- [ ] User name configured
- [ ] Files added to git
- [ ] Initial commit created

### Step 3: Connect to GitHub

```bash
git remote add origin https://github.com/elmoudni-fatimazahrae/student-managment.git
git branch -M main
git push -u origin main
```

Checklist:
- [ ] Remote added successfully
- [ ] Branch renamed to main
- [ ] Code pushed to GitHub
- [ ] Repository is public on GitHub
- [ ] All files visible on GitHub

### Step 4: Verify GitHub

- [ ] Visit https://github.com/elmoudni-fatimazahrae/student-managment
- [ ] [ ] Repository is public
- [ ] [ ] All files are present
- [ ] [ ] README.md displays correctly
- [ ] [ ] No sensitive files exposed (.env files)

## Vercel Deployment

### Step 1: Prepare for Deployment

Before deploying to Vercel:

- [ ] All tests pass locally
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] ESLint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Database configured for production (PostgreSQL recommended)

### Step 2: Create Vercel Account

- [ ] Go to https://vercel.com
- [ ] Sign up or login
- [ ] Authorize Vercel to access GitHub account

### Step 3: Import Project in Vercel

- [ ] Click "Add New" → "Project"
- [ ] Select your GitHub repository: `student-managment`
- [ ] Click "Import"
- [ ] Wait for project configuration

### Step 4: Configure Environment Variables

In Vercel project settings, add:

```
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32 or use online generator>
DATABASE_URL=file:./prisma/dev.db  (or PostgreSQL URL for production)
```

Checklist:
- [ ] NEXTAUTH_URL set to production domain
- [ ] NEXTAUTH_SECRET generated and added
- [ ] DATABASE_URL configured
- [ ] Variables are NOT exposed in repository
- [ ] All variables marked as sensitive if applicable

### Step 5: Deploy

- [ ] Click "Deploy"
- [ ] Wait for build to complete (usually 1-2 minutes)
- [ ] Wait for deployment to complete
- [ ] Visit production URL
- [ ] Verify application is running

Checklist:
- [ ] Build successful
- [ ] No build errors
- [ ] Deployment successful
- [ ] Application accessible at URL
- [ ] Default pages load

### Step 6: Post-Deployment Verification

- [ ] [ ] Homepage loads (http://your-domain.com)
- [ ] [ ] Login page accessible
- [ ] [ ] Can login with admin credentials
- [ ] [ ] Dashboard loads and shows statistics
- [ ] [ ] Can view students page
- [ ] [ ] Can view courses page
- [ ] [ ] Can view enrollments page
- [ ] [ ] Can add a new student
- [ ] [ ] Can add a new course
- [ ] [ ] Forms validate properly
- [ ] [ ] Error handling works

### Step 7: Monitoring Setup

- [ ] Set up deployment notifications
- [ ] Configure auto-deployments from main branch
- [ ] Review analytics in Vercel dashboard
- [ ] Monitor performance metrics
- [ ] Set up error tracking (optional)

## Docker Deployment (Alternative)

### Step 1: Build Docker Image

```bash
docker build -t student-management:latest .
```

Checklist:
- [ ] Docker installed
- [ ] Build successful
- [ ] No build errors
- [ ] Image created: ~300MB

### Step 2: Test Docker Image Locally

```bash
docker run -p 3000:3000 \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e NEXTAUTH_SECRET=test-secret \
  -e DATABASE_URL=file:./prisma/dev.db \
  student-management:latest
```

Checklist:
- [ ] Container starts
- [ ] Application accessible at http://localhost:3000
- [ ] Login works
- [ ] All features functional
- [ ] No errors in logs

### Step 3: Push to Container Registry

Choose one:

**Docker Hub:**
```bash
docker login
docker tag student-management:latest username/student-management:latest
docker push username/student-management:latest
```

**GitHub Container Registry:**
```bash
docker login ghcr.io
docker tag student-management:latest ghcr.io/username/student-management:latest
docker push ghcr.io/username/student-management:latest
```

Checklist:
- [ ] Logged in to registry
- [ ] Image tagged correctly
- [ ] Image pushed successfully

## Maintenance Checklist

### Weekly
- [ ] Check Vercel analytics
- [ ] Review error logs
- [ ] Verify database is healthy
- [ ] Test login functionality

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Run npm audit: `npm audit`
- [ ] Check for TypeScript errors
- [ ] Review code quality
- [ ] Backup database (if applicable)

### Quarterly
- [ ] Update Node.js if major version released
- [ ] Review and update documentation
- [ ] Performance optimization review
- [ ] Security audit

## Troubleshooting

### Build Fails on Vercel
- [ ] Check build logs in Vercel dashboard
- [ ] Verify all environment variables are set
- [ ] Ensure DATABASE_URL is correct
- [ ] Run `npm run build` locally to test
- [ ] Check for TypeScript errors: `npx tsc --noEmit`

### Application Won't Start
- [ ] Check function logs in Vercel
- [ ] Verify environment variables
- [ ] Test database connection
- [ ] Review error messages in console

### Database Connection Issues
- [ ] Verify DATABASE_URL format
- [ ] Check if database is accessible
- [ ] Verify credentials if using PostgreSQL
- [ ] Run database migrations: `npm run db:push`

### Authentication Not Working
- [ ] Verify NEXTAUTH_URL matches domain
- [ ] Check NEXTAUTH_SECRET is set
- [ ] Ensure cookies are enabled in browser
- [ ] Clear browser cache and cookies
- [ ] Check if HTTPS is required

## Rollback Plan

If deployment fails:

1. Go to Vercel dashboard → Deployments
2. Find last working deployment
3. Click "Promote to Production"
4. Verify application is restored
5. Investigate and fix issues locally
6. Redeploy

Alternative:
1. Delete current Vercel project
2. Reimport from GitHub
3. Redeploy with known-good configuration

## Success Criteria

✅ **Deployment is successful when:**

- [ ] Application is publicly accessible
- [ ] All pages load without errors
- [ ] Authentication works correctly
- [ ] Database operations function properly
- [ ] No console errors in browser
- [ ] Performance metrics are acceptable
- [ ] Application is responsive on mobile
- [ ] All CRUD operations work
- [ ] Students can be created, read, updated
- [ ] Courses can be created, read, updated
- [ ] Enrollments can be created, read, updated

## Production Readiness Checklist

- [ ] Code is in version control (GitHub)
- [ ] All tests pass
- [ ] No console errors
- [ ] Environment variables are secure
- [ ] Database is properly configured
- [ ] HTTPS is enabled
- [ ] Monitoring is set up
- [ ] Backup plan is in place
- [ ] Documentation is up to date
- [ ] Team knows how to deploy

## Post-Deployment

### Day 1
- [ ] Monitor application closely
- [ ] Check error logs every hour
- [ ] Verify all features work
- [ ] Monitor response times
- [ ] Check database performance

### Week 1
- [ ] Monitor performance metrics
- [ ] Review user feedback
- [ ] Check analytics
- [ ] Optimize if needed
- [ ] Document any issues

### Month 1
- [ ] Review production metrics
- [ ] Assess performance
- [ ] Plan improvements
- [ ] Update documentation
- [ ] Schedule regular monitoring

## Quick Reference

### Essential Commands

```bash
# Local Development
npm install
npm run db:init
npm run dev

# Testing
npm run build
npm run lint

# Database
npm run db:push
npm run db:seed

# Git & GitHub
git add .
git commit -m "message"
git push origin main

# Docker
docker build -t student-management .
docker run -p 3000:3000 student-management
```

### Important URLs

- **GitHub Repository**: https://github.com/elmoudni-fatimazahrae/student-managment
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Development**: http://localhost:3000
- **Production**: https://your-project-name.vercel.app

### Support Documentation

- **README.md** - Full documentation
- **QUICKSTART.md** - Quick start guide
- **INSTALLATION.md** - Setup instructions
- **VERCEL_DEPLOYMENT.md** - Vercel setup
- **DOCKER_DEPLOYMENT.md** - Docker setup

## Status Tracker

- [ ] Local development ready
- [ ] GitHub repository created
- [ ] Code committed and pushed
- [ ] Vercel account ready
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] First deployment successful
- [ ] Post-deployment testing completed
- [ ] Monitoring set up
- [ ] Documentation complete

---

**Deployment Date**: ________________  
**Deployed By**: ________________  
**Vercel URL**: ________________  
**GitHub URL**: https://github.com/elmoudni-fatimazahrae/student-managment  
**Status**: ☐ In Progress ☐ Complete ☐ Issues

**Notes**: _________________________________________________________________
