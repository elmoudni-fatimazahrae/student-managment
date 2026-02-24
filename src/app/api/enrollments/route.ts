import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const enrollments = await prisma.enrollment.findMany({
      orderBy: { enrollmentDate: "desc" },
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: body.studentId,
        courseId: body.courseId,
        grade: body.grade || null,
        status: body.status || "active",
      },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error: any) {
    console.error(error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Student is already enrolled in this course" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
