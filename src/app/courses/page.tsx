"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, FormEvent } from "react"

interface Course {
  id: number
  code: string
  title: string
  description?: string
  credits: number
  semester: number
}

export default function CoursesPage() {
  const { data: session, status } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    credits: 3,
    semester: 1,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
  }, [status])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses")
        if (res.ok) {
          const data = await res.json()
          setCourses(data)
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchCourses()
    }
  }, [session])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          credits: parseInt(formData.credits.toString()),
          semester: parseInt(formData.semester.toString()),
        }),
      })

      if (res.ok) {
        const newCourse = await res.json()
        setCourses([newCourse, ...courses])
        setFormData({
          code: "",
          title: "",
          description: "",
          credits: 3,
          semester: 1,
        })
        setShowForm(false)
      }
    } catch (error) {
      console.error("Failed to add course:", error)
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
                Course Management
              </h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? "Cancel" : "Add Course"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Add Course Form */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-6">Add New Course</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Course Code (e.g., CS101)"
                  className="input-field"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Course Title"
                  className="input-field"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Credits"
                  className="input-field"
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData({ ...formData, credits: parseInt(e.target.value) })
                  }
                  required
                  min="1"
                  max="6"
                />
                <select
                  className="input-field"
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: parseInt(e.target.value) })
                  }
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Description"
                className="input-field"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
              <button type="submit" className="btn-primary">
                Add Course
              </button>
            </form>
          </div>
        )}

        {/* Courses Table */}
        <div className="card">
          {loading ? (
            <p className="text-center text-gray-600">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No courses found. Add one to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Code</th>
                    <th className="text-left py-3 px-4 font-semibold">Title</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Credits
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Semester
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold">{course.code}</td>
                      <td className="py-3 px-4">{course.title}</td>
                      <td className="py-3 px-4">{course.credits}</td>
                      <td className="py-3 px-4">{course.semester}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {course.description || "-"}
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
