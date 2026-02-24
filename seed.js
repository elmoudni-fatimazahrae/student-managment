const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Seeding database with initial data...\n");

    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("password123", 10);

      await prisma.user.create({
        data: {
          email: "admin@example.com",
          name: "Admin User",
          password: hashedPassword,
          role: "admin",
        },
      });

      console.log("✅ Admin user created successfully");
      console.log("   📧 Email: admin@example.com");
      console.log("   🔑 Password: password123\n");
    } else {
      console.log("✅ Admin user already exists\n");
    }

    // Create sample students
    const studentsCount = await prisma.student.count();
    if (studentsCount === 0) {
      await prisma.student.createMany({
        data: [
          {
            email: "john.doe@student.com",
            firstName: "John",
            lastName: "Doe",
            phone: "+1234567890",
            city: "New York",
            major: "Computer Science",
            enrollmentYear: 2023,
          },
          {
            email: "jane.smith@student.com",
            firstName: "Jane",
            lastName: "Smith",
            phone: "+1234567891",
            city: "Boston",
            major: "Mathematics",
            enrollmentYear: 2023,
          },
          {
            email: "mike.johnson@student.com",
            firstName: "Mike",
            lastName: "Johnson",
            phone: "+1234567892",
            city: "Chicago",
            major: "Physics",
            enrollmentYear: 2022,
          },
        ],
      });

      console.log("✅ 3 sample students created");
    }

    // Create sample courses
    const coursesCount = await prisma.course.count();
    if (coursesCount === 0) {
      await prisma.course.createMany({
        data: [
          {
            code: "CS101",
            title: "Introduction to Computer Science",
            credits: 3,
            semester: 1,
            description: "Fundamentals of programming and algorithms",
          },
          {
            code: "MATH201",
            title: "Calculus I",
            credits: 4,
            semester: 1,
            description: "Differential calculus and limits",
          },
          {
            code: "PHYS101",
            title: "Physics I: Mechanics",
            credits: 4,
            semester: 1,
            description: "Classical mechanics and motion",
          },
          {
            code: "CS102",
            title: "Data Structures",
            credits: 3,
            semester: 2,
            description: "Trees, graphs, and advanced data structures",
          },
        ],
      });

      console.log("✅ 4 sample courses created");
    }

    // Create sample enrollments
    const enrollmentsCount = await prisma.enrollment.count();
    if (enrollmentsCount === 0) {
      const students = await prisma.student.findMany({ take: 3 });
      const courses = await prisma.course.findMany({ take: 4 });

      if (students.length > 0 && courses.length > 0) {
        await prisma.enrollment.createMany({
          data: [
            {
              studentId: students[0].id,
              courseId: courses[0].id,
              status: "active",
              grade: "A",
            },
            {
              studentId: students[0].id,
              courseId: courses[1].id,
              status: "active",
              grade: "B+",
            },
            {
              studentId: students[1].id,
              courseId: courses[0].id,
              status: "active",
              grade: "A-",
            },
            {
              studentId: students[1].id,
              courseId: courses[2].id,
              status: "active",
              grade: "B",
            },
            {
              studentId: students[2].id,
              courseId: courses[1].id,
              status: "completed",
              grade: "A",
            },
          ],
        });

        console.log("✅ 5 sample enrollments created");
      }
    }

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📊 Seed Summary:");
    console.log(`   - Users: ${(await prisma.user.count())}`);
    console.log(`   - Students: ${(await prisma.student.count())}`);
    console.log(`   - Courses: ${(await prisma.course.count())}`);
    console.log(`   - Enrollments: ${(await prisma.enrollment.count())}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
