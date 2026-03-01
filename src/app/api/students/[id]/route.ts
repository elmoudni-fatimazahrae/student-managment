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

    const student = await prisma.student.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student)
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

    const student = await prisma.student.update({
      where: { id: parseInt(params.id) },
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
        status: body.status || "active",
      },
    })

    return NextResponse.json(student)
  } catch (error: any) {
    console.error(error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Student with this email already exists" },
        { status: 400 }
      )
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
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

    await prisma.student.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ message: "Student deleted successfully" })
  } catch (error: any) {
    console.error(error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
