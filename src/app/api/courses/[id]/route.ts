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

    const course = await prisma.course.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
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

    const course = await prisma.course.update({
      where: { id: parseInt(params.id) },
      data: {
        code: body.code,
        title: body.title,
        description: body.description || null,
        credits: parseInt(body.credits),
        semester: parseInt(body.semester),
      },
    })

    return NextResponse.json(course)
  } catch (error: any) {
    console.error(error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Course with this code already exists" },
        { status: 400 }
      )
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
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

    await prisma.course.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error: any) {
    console.error(error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
