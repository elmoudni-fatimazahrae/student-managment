"use client"

import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

interface DashboardStats {
  studentCount: number
  courseCount: number
  enrollmentCount: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    studentCount: 0,
    courseCount: 0,
    enrollmentCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
  }, [status])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/courses"),
          fetch("/api/enrollments"),
        ])

        if (studentsRes.ok && coursesRes.ok && enrollmentsRes.ok) {
          const students = await studentsRes.json()
          const courses = await coursesRes.json()
          const enrollments = await enrollmentsRes.json()

          setStats({
            studentCount: students.length,
            courseCount: courses.length,
            enrollmentCount: enrollments.length,
          })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [session])

  if (status === "loading" || !session) {
    return <div className="text-center py-20">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">
            Student Management
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, {session.user?.name}
            </span>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
              className="btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card">
            <h3 className="text-gray-600 text-sm font-medium mb-2">
              Total Students
            </h3>
            <p className="text-4xl font-bold text-blue-600">
              {loading ? "..." : stats.studentCount}
            </p>
          </div>
          <div className="card">
            <h3 className="text-gray-600 text-sm font-medium mb-2">
              Total Courses
            </h3>
            <p className="text-4xl font-bold text-green-600">
              {loading ? "..." : stats.courseCount}
            </p>
          </div>
          <div className="card">
            <h3 className="text-gray-600 text-sm font-medium mb-2">
              Total Enrollments
            </h3>
            <p className="text-4xl font-bold text-purple-600">
              {loading ? "..." : stats.enrollmentCount}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Student Management</h2>
            <p className="text-gray-600 mb-4">
              Manage student information, registrations, and academic progress.
            </p>
            <Link href="/students" className="btn-primary inline-block">
              Manage Students
            </Link>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Course Management</h2>
            <p className="text-gray-600 mb-4">
              Add, edit, and manage courses and semester information.
            </p>
            <Link href="/courses" className="btn-primary inline-block">
              Manage Courses
            </Link>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Enrollments</h2>
            <p className="text-gray-600 mb-4">
              View and manage student course enrollments.
            </p>
            <Link href="/enrollments" className="btn-primary inline-block">
              View Enrollments
            </Link>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Reports</h2>
            <p className="text-gray-600 mb-4">
              Generate and view academic reports and statistics.
            </p>
            <button className="btn-primary" disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
