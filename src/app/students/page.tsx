"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, FormEvent } from "react"

interface Student {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  city?: string
  major?: string
  status: string
}

export default function StudentsPage() {
  const { data: session, status } = useSession()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    major: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
  }, [status])

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students")
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
        }
      } catch (error) {
        console.error("Failed to fetch students:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchStudents()
    }
  }, [session])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const newStudent = await res.json()
        setStudents([newStudent, ...students])
        setFormData({
          email: "",
          firstName: "",
          lastName: "",
          phone: "",
          city: "",
          major: "",
        })
        setShowForm(false)
      }
    } catch (error) {
      console.error("Failed to add student:", error)
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
                Student Management
              </h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? "Cancel" : "Add Student"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Add Student Form */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-6">Add New Student</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="First Name"
                  className="input-field"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="input-field"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="City"
                  className="input-field"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Major"
                  className="input-field"
                  value={formData.major}
                  onChange={(e) =>
                    setFormData({ ...formData, major: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="btn-primary">
                Add Student
              </button>
            </form>
          </div>
        )}

        {/* Students Table */}
        <div className="card">
          {loading ? (
            <p className="text-center text-gray-600">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No students found. Add one to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold">City</th>
                    <th className="text-left py-3 px-4 font-semibold">Major</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="py-3 px-4">{student.email}</td>
                      <td className="py-3 px-4">{student.phone || "-"}</td>
                      <td className="py-3 px-4">{student.city || "-"}</td>
                      <td className="py-3 px-4">{student.major || "-"}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          {student.status}
                        </span>
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
