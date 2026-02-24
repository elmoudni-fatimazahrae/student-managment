import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

async function main() {
  try {
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("password123", 10)

      await prisma.user.create({
        data: {
          email: "admin@example.com",
          name: "Admin User",
          password: hashedPassword,
          role: "admin",
        },
      })

      console.log("✅ Admin user created successfully")
      console.log("📧 Email: admin@example.com")
      console.log("🔑 Password: password123")
    } else {
      console.log("✅ Admin user already exists")
    }

    // Create sample data
    const studentsCount = await prisma.student.count()
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
            major: "Computer Science",
            enrollmentYear: 2024,
          },
        ],
      })

      console.log("✅ Sample students created")
    }

    const coursesCount = await prisma.course.count()
    if (coursesCount === 0) {
      await prisma.course.createMany({
        data: [
          {
            code: "CS101",
            title: "Introduction to Programming",
            description: "Learn the basics of programming with Python",
            credits: 3,
            semester: 1,
          },
          {
            code: "CS201",
            title: "Data Structures",
            description: "Study of fundamental data structures",
            credits: 4,
            semester: 2,
          },
          {
            code: "MATH101",
            title: "Calculus I",
            description: "Differential calculus and applications",
            credits: 4,
            semester: 1,
          },
          {
            code: "MATH201",
            title: "Linear Algebra",
            description: "Vectors, matrices, and linear transformations",
            credits: 3,
            semester: 2,
          },
        ],
      })

      console.log("✅ Sample courses created")
    }

    console.log("✅ Database initialization complete!")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
