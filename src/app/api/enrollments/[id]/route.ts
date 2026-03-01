import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const enrollment = await prisma.enrollment.update({
      where: { id: parseInt(params.id) },
      data: {
        studentId: parseInt(body.studentId),
        courseId: parseInt(body.courseId),
        grade: body.grade || null,
        status: body.status || "active",
      },
    })

    return NextResponse.json(enrollment)
  } catch (error: any) {
    console.error(error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Student is already enrolled in this course" },
        { status: 400 }
      )
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.enrollment.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ message: "Enrollment deleted successfully" })
  } catch (error: any) {
    console.error(error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
