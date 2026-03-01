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

interface Student {
  id: number
  firstName: string
  lastName: string
  email: string
}

interface Course {
  id: number
  code: string
  title: string
}

const emptyForm = {
  studentId: "",
  courseId: "",
  grade: "",
  status: "active",
}

export default function EnrollmentsPage() {
  const { data: session, status } = useSession()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
  }, [status])

  useEffect(() => {
    if (session) fetchAll()
  }, [session])

  async function fetchAll() {
    try {
      const [enrollRes, studentRes, courseRes] = await Promise.all([
        fetch("/api/enrollments"),
        fetch("/api/students"),
        fetch("/api/courses"),
      ])
      if (enrollRes.ok) setEnrollments(await enrollRes.json())
      if (studentRes.ok) setStudents(await studentRes.json())
      if (courseRes.ok) setCourses(await courseRes.json())
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  function getStudentName(id: number) {
    const s = students.find((s) => s.id === id)
    return s ? `${s.firstName} ${s.lastName}` : `Student #${id}`
  }

  function getCourseName(id: number) {
    const c = courses.find((c) => c.id === id)
    return c ? `${c.code} - ${c.title}` : `Course #${id}`
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const payload = {
      studentId: parseInt(formData.studentId),
      courseId: parseInt(formData.courseId),
      grade: formData.grade || null,
      status: formData.status,
    }
    try {
      if (editingId) {
        const res = await fetch(`/api/enrollments/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const updated = await res.json()
          setEnrollments(enrollments.map((e) => (e.id === editingId ? updated : e)))
          showToast("Enrollment updated successfully", "success")
        } else {
          const err = await res.json()
          showToast(err.error || "Failed to update enrollment", "error")
          return
        }
      } else {
        const res = await fetch("/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const newEnrollment = await res.json()
          setEnrollments([newEnrollment, ...enrollments])
          showToast("Enrollment added successfully", "success")
        } else {
          const err = await res.json()
          showToast(err.error || "Failed to add enrollment", "error")
          return
        }
      }
      resetForm()
    } catch (error) {
      showToast("An error occurred", "error")
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/enrollments/${id}`, { method: "DELETE" })
      if (res.ok) {
        setEnrollments(enrollments.filter((e) => e.id !== id))
        showToast("Enrollment deleted successfully", "success")
      } else {
        const err = await res.json()
        showToast(err.error || "Failed to delete enrollment", "error")
      }
    } catch (error) {
      showToast("An error occurred", "error")
    }
    setDeleteConfirm(null)
  }

  function startEdit(enrollment: Enrollment) {
    setEditingId(enrollment.id)
    setFormData({
      studentId: enrollment.studentId.toString(),
      courseId: enrollment.courseId.toString(),
      grade: enrollment.grade || "",
      status: enrollment.status,
    })
    setShowForm(true)
  }

  function resetForm() {
    setFormData(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const filteredEnrollments = enrollments.filter((e) => {
    const studentName = getStudentName(e.studentId).toLowerCase()
    const courseName = getCourseName(e.courseId).toLowerCase()
    const q = searchQuery.toLowerCase()
    return studentName.includes(q) || courseName.includes(q) || (e.grade || "").toLowerCase().includes(q)
  })

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={toast.type === "success" ? "toast-success" : "toast-error"}>
          {toast.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Enrollment</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this enrollment? This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="nav-link flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Enrollments</h1>
              <span className="badge-green">{enrollments.length}</span>
            </div>
            <button
              onClick={() => { showForm && !editingId ? resetForm() : (resetForm(), setShowForm(true)) }}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={showForm && !editingId ? "M6 18L18 6M6 6l12 12" : "M12 4.5v15m7.5-7.5h-15"} />
              </svg>
              {showForm && !editingId ? "Cancel" : "Add Enrollment"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form */}
        {showForm && (
          <div className="card mb-8 border-l-4 border-l-indigo-500">
            <h2 className="text-lg font-semibold mb-6">
              {editingId ? "Edit Enrollment" : "Add New Enrollment"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                  <select className="input-field" value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} required>
                    <option value="">Select a student</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                  <select className="input-field" value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} required>
                    <option value="">Select a course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <select className="input-field" value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}>
                    <option value="">No grade yet</option>
                    {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="input-field" value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className={editingId ? "btn-success" : "btn-primary"}>
                  {editingId ? "Save Changes" : "Add Enrollment"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Search enrollments..." className="input-field pl-10"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="skeleton h-4 flex-1"></div>
                  <div className="skeleton h-4 flex-1"></div>
                  <div className="skeleton h-4 w-24"></div>
                </div>
              ))}
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-16">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
              <p className="text-gray-500 font-medium">No enrollments found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery ? "Try a different search term" : "Add an enrollment to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header">Course</th>
                    <th className="table-header">Grade</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Enrollment Date</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-medium text-gray-900">
                        {getStudentName(enrollment.studentId)}
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-mono font-bold">
                          {courses.find((c) => c.id === enrollment.courseId)?.code || "?"}
                        </span>
                        <span className="ml-2 text-gray-600">
                          {courses.find((c) => c.id === enrollment.courseId)?.title || `#${enrollment.courseId}`}
                        </span>
                      </td>
                      <td className="table-cell">
                        {enrollment.grade ? (
                          <span className={`badge ${
                            enrollment.grade.startsWith("A") ? "badge-green" :
                            enrollment.grade.startsWith("B") ? "badge-blue" :
                            enrollment.grade.startsWith("C") ? "badge-yellow" : "badge-red"
                          }`}>
                            {enrollment.grade}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className={
                          enrollment.status === "active" ? "badge-green" :
                          enrollment.status === "completed" ? "badge-blue" : "badge-red"
                        }>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="table-cell text-gray-500">
                        {new Date(enrollment.enrollmentDate).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric"
                        })}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(enrollment)}
                            className="btn-icon text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-200" title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteConfirm(enrollment.id)}
                            className="btn-icon text-red-600 hover:bg-red-50 focus:ring-red-200" title="Delete">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
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
