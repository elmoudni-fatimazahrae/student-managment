// Seed Neon PostgreSQL database with sample data
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString =
  "postgresql://neondb_owner:npg_lkz9OMRcwg5G@ep-morning-bird-ai2rqgiz-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("🌱 Seeding Neon PostgreSQL database...\n");
    await client.connect();

    // Check if admin exists
    const adminCheck = await client.query(
      `SELECT id FROM "users" WHERE email = $1`,
      ["admin@example.com"]
    );

    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await client.query(
        `INSERT INTO "users" (email, name, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        ["admin@example.com", "Admin User", hashedPassword, "admin"]
      );
      console.log("✅ Admin user created");
      console.log("   📧 Email: admin@example.com");
      console.log("   🔑 Password: password123\n");
    } else {
      console.log("✅ Admin user already exists\n");
    }

    // Seed students
    const studentsCount = await client.query(`SELECT COUNT(*) FROM "students"`);
    if (parseInt(studentsCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO "students" (email, "firstName", "lastName", phone, city, major, "enrollmentYear", "createdAt", "updatedAt") VALUES
        ('john.doe@student.com', 'John', 'Doe', '+1234567890', 'New York', 'Computer Science', 2023, NOW(), NOW()),
        ('jane.smith@student.com', 'Jane', 'Smith', '+1234567891', 'Boston', 'Mathematics', 2023, NOW(), NOW()),
        ('mike.johnson@student.com', 'Mike', 'Johnson', '+1234567892', 'Chicago', 'Physics', 2022, NOW(), NOW())
      `);
      console.log("✅ 3 sample students created");
    } else {
      console.log("✅ Students already exist");
    }

    // Seed courses
    const coursesCount = await client.query(`SELECT COUNT(*) FROM "courses"`);
    if (parseInt(coursesCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO "courses" (code, title, description, credits, semester, "createdAt", "updatedAt") VALUES
        ('CS101', 'Introduction to Computer Science', 'Fundamentals of programming and algorithms', 3, 1, NOW(), NOW()),
        ('MATH201', 'Calculus I', 'Differential calculus and limits', 4, 1, NOW(), NOW()),
        ('PHYS101', 'Physics I: Mechanics', 'Classical mechanics and motion', 4, 1, NOW(), NOW()),
        ('CS102', 'Data Structures', 'Trees, graphs, and advanced data structures', 3, 2, NOW(), NOW())
      `);
      console.log("✅ 4 sample courses created");
    } else {
      console.log("✅ Courses already exist");
    }

    // Seed enrollments
    const enrollmentsCount = await client.query(`SELECT COUNT(*) FROM "enrollments"`);
    if (parseInt(enrollmentsCount.rows[0].count) === 0) {
      const students = await client.query(`SELECT id FROM "students" ORDER BY id LIMIT 3`);
      const courses = await client.query(`SELECT id FROM "courses" ORDER BY id LIMIT 4`);

      if (students.rows.length >= 3 && courses.rows.length >= 4) {
        const s = students.rows;
        const c = courses.rows;
        await client.query(`
          INSERT INTO "enrollments" ("studentId", "courseId", grade, status, "enrollmentDate", "createdAt", "updatedAt") VALUES
          ($1, $2, 'A', 'active', NOW(), NOW(), NOW()),
          ($3, $4, 'B+', 'active', NOW(), NOW(), NOW()),
          ($5, $6, 'A-', 'active', NOW(), NOW(), NOW()),
          ($7, $8, 'B', 'active', NOW(), NOW(), NOW()),
          ($9, $10, 'A', 'completed', NOW(), NOW(), NOW())
        `, [s[0].id, c[0].id, s[0].id, c[1].id, s[1].id, c[0].id, s[1].id, c[2].id, s[2].id, c[1].id]);
        console.log("✅ 5 sample enrollments created");
      }
    } else {
      console.log("✅ Enrollments already exist");
    }

    // Summary
    const userCount = await client.query(`SELECT COUNT(*) FROM "users"`);
    const studentCount = await client.query(`SELECT COUNT(*) FROM "students"`);
    const courseCount = await client.query(`SELECT COUNT(*) FROM "courses"`);
    const enrollmentCount = await client.query(`SELECT COUNT(*) FROM "enrollments"`);

    console.log("\n✨ Database seeding completed!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Users: ${userCount.rows[0].count}`);
    console.log(`   - Students: ${studentCount.rows[0].count}`);
    console.log(`   - Courses: ${courseCount.rows[0].count}`);
    console.log(`   - Enrollments: ${enrollmentCount.rows[0].count}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

main();
