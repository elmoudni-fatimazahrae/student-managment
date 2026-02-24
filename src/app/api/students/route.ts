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

    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(students)
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

    const student = await prisma.student.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        zipCode: body.zipCode || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        enrollmentYear: body.enrollmentYear || null,
        major: body.major || null,
      },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error: any) {
    console.error(error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Student with this email already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
