# Installation & Setup Guide

## Prerequisites

This project requires the following to be installed on your system:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Git** (v2.40 or higher) - [Download here](https://git-scm.com/)

### Installing Node.js

#### On Windows
1. Visit https://nodejs.org/
2. Download the LTS (Long Term Support) version
3. Run the installer and follow the setup wizard
4. Accept the license and default settings
5. Restart your computer after installation
6. Verify installation: Open PowerShell and run:
   ```powershell
   node --version
   npm --version
   ```

### Installing Git

#### On Windows
1. Visit https://git-scm.com/download/win
2. Download and run the installer
3. Follow the installation wizard with default settings
4. Restart your computer after installation
5. Verify installation: Open PowerShell and run:
   ```powershell
   git --version
   ```

## Setup Instructions

Once Node.js and Git are installed, follow these steps:

### 1. Navigate to Project Directory
```powershell
cd C:\Users\PC\Documents\app
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Initialize Git Repository (First Time Only)
```powershell
git init
git config user.email "f.elmoudni@esisa.ac.ma"
git config user.name "Student Management"
git add .
git commit -m "Initial commit: Complete student management system with Next.js, SQLite, and NextAuth"
```

### 4. Initialize Database
```powershell
npm run db:init
```

This command will:
- Create the SQLite database
- Run Prisma migrations
- Seed the database with sample data and admin user

### 5. Start Development Server
```powershell
npm run dev
```

The application will start at http://localhost:3000

## Login Credentials

Use these credentials to sign in:
- **Email**: admin@example.com
- **Password**: password123

## Verify Installation

To verify everything is working:

1. Open http://localhost:3000 in your browser
2. You should see the Student Management System homepage
3. Click "Sign In"
4. Enter the admin credentials above
5. You should be redirected to the dashboard

## Push to GitHub

### 1. Create Repository on GitHub

Visit https://github.com/new and create a new repository named `student-management` 
with the owner account elm oudni-fatimazahrae

### 2. Connect Local Repository to GitHub

```powershell
git remote add origin https://github.com/elmoudni-fatimazahrae/student-managment.git
git branch -M main
git push -u origin main
```

### 3. Push Code

For subsequent pushes:
```powershell
git add .
git commit -m "Your commit message"
git push
```

## Deployment to Vercel

### 1. Connect to Vercel

1. Sign up at https://vercel.com
2. Install Vercel CLI:
   ```powershell
   npm i -g vercel
   ```
3. Deploy:
   ```powershell
   vercel
   ```

### 2. Configure Environment Variables in Vercel

In your Vercel project settings, add:
- `NEXTAUTH_URL` = Your production URL
- `NEXTAUTH_SECRET` = Generate with: `openssl rand -base64 32`
- `DATABASE_URL` = file:./prisma/dev.db

## Troubleshooting

### npm: command not found
- Node.js is not installed or not added to PATH
- Restart your computer after installing Node.js
- Check PATH: Run `$env:Path` and look for Node.js installation directory

### git: command not found
- Git is not installed or not added to PATH
- Restart your computer after installing Git
- Check PATH: Run `$env:Path` and look for Git installation directory

### Database errors
- Delete `prisma/dev.db` and run `npm run db:init` again
- Ensure SQLite3 development libraries are installed

### Port 3000 already in use
- Run on different port: `npm run dev -- -p 3001`
- Or kill process using port 3000

## Build for Production

```powershell
npm run build
npm start
```

The production build will start at http://localhost:3000

## Additional Commands

- `npm run lint` - Check code quality with ESLint
- `npm run db:push` - Sync database schema
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with sample data

## Documentation

See [README.md](./README.md) for full project documentation.
