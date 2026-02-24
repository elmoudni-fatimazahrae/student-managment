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

    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(courses)
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

    const course = await prisma.course.create({
      data: {
        code: body.code,
        title: body.title,
        description: body.description || null,
        credits: body.credits,
        semester: body.semester,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error: any) {
    console.error(error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Course with this code already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
