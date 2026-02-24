# Environment Variables Guide

## For Local Development (SQLite)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
DATABASE_URL=file:./prisma/dev.db
```

## For Vercel Production - Option A: SQLite (Temporary Data)
```
NEXTAUTH_URL=https://student-managment4-iota.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
DATABASE_URL=file:./prisma/dev.db
```

## For Vercel Production - Option B: PostgreSQL (Persistent) - RECOMMENDED

### Step 1: Create a free PostgreSQL database
Choose one:
- **Neon.tech** (Recommended - easiest): https://neon.tech
- **Supabase**: https://supabase.com
- **Railway.app**: https://railway.app

### Step 2: Get your connection string
The format is: `postgresql://user:password@host:port/database?sslmode=require`

### Step 3: Add to Vercel Environment Variables
```
NEXTAUTH_URL=https://student-managment4-iota.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
DATABASE_URL=<your-postgresql-connection-string>
```

### Step 4: Update Prisma Schema
Change `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 5: Deploy
```bash
git push origin main  # Trigger Vercel redeploy
```

Vercel will automatically:
1. Generate Prisma Client
2. Create tables in PostgreSQL
3. Start the app

## Generating NEXTAUTH_SECRET

Open terminal and run:
```bash
openssl rand -base64 32
```

Copy the output and paste it into Vercel's NEXTAUTH_SECRET environment variable.

---

## Recommendation

**Use PostgreSQL for production** (Option B) because:
- ✅ Data persists between deployments
- ✅ Works reliably on Vercel
- ✅ Free tier is sufficient for development
- ❌ SQLite will lose all data when Vercel redeploys

**Use SQLite only for local development**.
