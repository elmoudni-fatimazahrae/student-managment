# PostgreSQL Setup Guide - Neon.tech (Recommended)

## Step 1: Create Free Database at Neon.tech

1. Go to https://neon.tech
2. Click **Sign Up** (use Google or GitHub)
3. Create a new project
4. Choose region closest to you
5. Click **Create Project** - takes ~5 seconds

## Step 2: Get Connection String

1. In Neon dashboard, find your connection string
2. It will look like:
   ```
   postgresql://neon_user:password@ep-xxxxxx.neon.tech/main?sslmode=require
   ```
3. Copy the full string

## Step 3: Update .env.local

Replace the `DATABASE_URL` in `.env.local`:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=BBOVmXaGBtvo7D4sgjoHVb/zhv0jNWFBpcCaGibqhJ0=
DATABASE_URL=<paste-your-neon-connection-string-here>
```

## Step 4: Initialize Database

```bash
npm run db:push
npm run db:seed
```

## Step 5: Start Development Server

```bash
npm run dev
```

## For Vercel Production

1. Go to Vercel project settings (Environment Variables)
2. Add same `DATABASE_URL` to Vercel
3. Redeploy

---

## Alternative: Use Local PostgreSQL

If you prefer local, you need:
- PostgreSQL installed on Windows
- Create a database: `createdb student_management`
- Connection string: `postgresql://postgres:your_password@localhost:5432/student_management`
- Then follow Step 3 above

