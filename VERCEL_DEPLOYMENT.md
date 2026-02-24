# Vercel Deployment Guide

This guide explains how to deploy the Student Management System to Vercel.

## Important: Database Configuration for Production

SQLite works well for local development but is **NOT RECOMMENDED** for Vercel production deployments because:
- Vercel's serverless functions have ephemeral file systems
- Each function invocation might see different database states
- Data changes are not persisted between invocations

### Recommended Solution: PostgreSQL

For production, we recommend using a free PostgreSQL database:

#### Option 1: PlanetScale (Recommended - MySQL)
1. Sign up at https://planetscale.com
2. Create a database
3. Get the connection string in the format: `mysql://user:password@host/database`
4. Update `.env.local` and Vercel with `DATABASE_URL`

#### Option 2: Neon (PostgreSQL)
1. Sign up at https://neon.tech
2. Create a project and database
3. Get the PostgreSQL connection string
4. Update Prisma schema datasource provider from `sqlite` to `postgresql`

#### Option 3: Railway (PostgreSQL)
1. Sign up at https://railway.app
2. Create a PostgreSQL database
3. Copy the connection string

## Database Setup Instructions

### Update Prisma Schema for PostgreSQL

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npm run db:push
npm run db:seed
```

## Step-by-Step Vercel Deployment

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment with PostgreSQL"
git push origin main
```

### 2. Create Vercel Account

1. Visit https://vercel.com
2. Sign up or log in
3. Authorize Vercel to access your GitHub account

### 3. Import Project

1. Click "Add New" → "Project"
2. Select your GitHub repository `student-management`
3. Click "Import"

### 4. Configure Environment Variables

In the "Environment Variables" section, add:

```
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
DATABASE_URL=<your PostgreSQL connection string>
```

**Important**: Do NOT commit sensitive environment variables to GitHub. Only add them in Vercel dashboard.

### 5. Configure Build Settings

The default settings should work:
- Framework: Next.js
- Build Command: `next build && prisma generate`
- Output Directory: `.next`
- Install Command: `npm ci`

### 6. Deploy

1. Click "Deploy"
2. Wait for the build and deployment to complete
3. Your app will be live at `https://your-project-name.vercel.app`

## Post-Deployment Steps

### 1. Initialize Database on Vercel

```bash
vercel env pull
npx prisma db push
```

### 2. Verify Deployment

1. Visit your deployed URL
2. Try to log in with admin credentials:
   - Email: admin@example.com
   - Password: password123
3. If login fails, run seed command:
   ```bash
   vercel env pull
   npx prisma db seed
   ```

### 3. Enable GitHub Auto-Deploy

In Vercel project settings, GitHub deployments are enabled by default. Any push to main will auto-deploy.

## Troubleshooting

### Build Fails: "prisma not found"
- Add to `vercel.json` buildCommand: `npm ci && npx prisma generate && next build`
- Or ensure devDependencies are installed: Change `npm ci` to `npm install`

**Solution**: Update package.json installCommand:
```json
"buildCommand": "npm install && npx prisma generate && next build"
```

### Environment Variables Not Working
- Ensure variables are added in Vercel Settings → Environment Variables
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Database Connection Fails
- Verify DATABASE_URL is correct
- Test connection: `psql $DATABASE_URL` (for PostgreSQL)
- Ensure firewall allows Vercel IP ranges

### NextAuth Configuration Issues
- Make sure `NEXTAUTH_URL` matches your Vercel domain exactly
- HTTPS is required in production
- Regenerate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

### Default Admin User Not Created
Run via Vercel CLI:
```bash
vercel env pull
npm run db:seed
```

## Monitoring Deployment

### View Logs
```bash
vercel logs <project-name>
```

### View Deployments
- Visit your Vercel project dashboard
- All deployments history is visible there

### Rollback

If something breaks:
1. Go to Vercel dashboard
2. Click "Deployments"
3. Select a previous working deployment
4. Click "Promote to Production"

## Custom Domain

To use a custom domain:

1. In Vercel project settings → Domains
2. Add your domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to your domain

## CI/CD Integration

The project automatically deploys when:
- Code is pushed to main branch
- Pull requests are created (preview deployments)

To skip a deployment, include `[skip-build]` in commit message.

## Performance Monitoring

Vercel provides:
- Build analytics
- Performance metrics
- Usage statistics

Access via project dashboard → Analytics tab

## Costs

- Hobby tier: Free for the purposes of this project
- Pro tier: Required for increased function duration and memory
- Database costs depend on your chosen provider

## Advanced: Using Vercel KV

For session storage without a full database:

```bash
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
```

Update NextAuth to use Vercel KV adapter (requires additional setup).

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Vercel Guide](https://nextjs.org/docs/deployment/vercel)
- [NextAuth Deployment](https://next-auth.js.org/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

## Summary

1. Choose database provider (PlanetScale/Neon/Railway)
2. Update Prisma schema if using PostgreSQL
3. Push to GitHub
4. Import project in Vercel
5. Add environment variables
6. Deploy
7. Seed database if needed
8. Test deployment

Your application is now live and automatically deploys on every Git push!
