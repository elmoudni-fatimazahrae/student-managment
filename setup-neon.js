// Create tables directly on Neon PostgreSQL
const { Client } = require("pg");

const connectionString =
  "postgresql://neondb_owner:npg_lkz9OMRcwg5G@ep-morning-bird-ai2rqgiz-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = `
-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS "students" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "zipCode" TEXT,
  "dateOfBirth" TIMESTAMP(3),
  "enrollmentYear" INTEGER,
  "major" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE IF NOT EXISTS "courses" (
  "id" SERIAL PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "credits" INTEGER NOT NULL,
  "semester" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS "enrollments" (
  "id" SERIAL PRIMARY KEY,
  "studentId" INTEGER NOT NULL,
  "courseId" INTEGER NOT NULL,
  "grade" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("studentId", "courseId")
);
`;

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting to Neon PostgreSQL...");
    await client.connect();
    console.log("Connected! Creating tables...");

    await client.query(sql);
    console.log("✅ All tables created successfully!");

    // Verify tables
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log("\nTables in database:");
    res.rows.forEach((r) => console.log(`  - ${r.table_name}`));
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

main();
