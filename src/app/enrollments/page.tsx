"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, FormEvent } from "react"

interface Enrollment {
  id: number
  studentId: number
  courseId: number
  grade?: string
  status: string
  enrollmentDate: string
}

export default function EnrollmentsPage() {
  const { data: session, status } = useSession()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
    grade: "",
    status: "active",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
  }, [status])

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch("/api/enrollments")
        if (res.ok) {
          const data = await res.json()
          setEnrollments(data)
        }
      } catch (error) {
        console.error("Failed to fetch enrollments:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchEnrollments()
    }
  }, [session])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: parseInt(formData.studentId),
          courseId: parseInt(formData.courseId),
          grade: formData.grade || null,
          status: formData.status,
        }),
      })

      if (res.ok) {
        const newEnrollment = await res.json()
        setEnrollments([newEnrollment, ...enrollments])
        setFormData({
          studentId: "",
          courseId: "",
          grade: "",
          status: "active",
        })
        setShowForm(false)
      }
    } catch (error) {
      console.error("Failed to add enrollment:", error)
    }
  }

  if (status === "loading" || !session) {
    return <div className="text-center py-20">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="nav-link text-xl font-bold">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Enrollments Management
              </h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? "Cancel" : "Add Enrollment"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Add Enrollment Form */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-6">Add New Enrollment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Student ID"
                  className="input-field"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Course ID"
                  className="input-field"
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Grade (optional)"
                  className="input-field"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                />
                <select
                  className="input-field"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">
                Add Enrollment
              </button>
            </form>
          </div>
        )}

        {/* Enrollments Table */}
        <div className="card">
          {loading ? (
            <p className="text-center text-gray-600">
              Loading enrollments...
            </p>
          ) : enrollments.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No enrollments found. Add one to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">
                      Student ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Course ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Grade</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Enrollment Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr
                      key={enrollment.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        Student #{enrollment.studentId}
                      </td>
                      <td className="py-3 px-4">Course #{enrollment.courseId}</td>
                      <td className="py-3 px-4">
                        {enrollment.grade || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          enrollment.status === "active"
                            ? "bg-green-100 text-green-800"
                            : enrollment.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
