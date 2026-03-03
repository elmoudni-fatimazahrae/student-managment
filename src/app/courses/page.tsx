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

const emptyForm = {
  code: "",
  title: "",
  description: "",
  credits: 3,
  semester: 1,
}

export default function CoursesPage() {
  const { data: session, status } = useSession()
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
    if (session) fetchCourses()
  }, [session])

  async function fetchCourses() {
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const payload = {
      ...formData,
      credits: parseInt(formData.credits.toString()),
      semester: parseInt(formData.semester.toString()),
    }
    try {
      if (editingId) {
        const res = await fetch(`/api/courses/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const updated = await res.json()
          setCourses(courses.map((c) => (c.id === editingId ? updated : c)))
          showToast("Course updated successfully", "success")
        } else {
          const err = await res.json()
          showToast(err.error || "Failed to update course", "error")
          return
        }
      } else {
        const res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const newCourse = await res.json()
          setCourses([newCourse, ...courses])
          showToast("Course added successfully", "success")
        } else {
          const err = await res.json()
          showToast(err.error || "Failed to add course", "error")
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
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCourses(courses.filter((c) => c.id !== id))
        showToast("Course deleted successfully", "success")
      } else {
        const err = await res.json()
        showToast(err.error || "Failed to delete course", "error")
      }
    } catch (error) {
      showToast("An error occurred", "error")
    }
    setDeleteConfirm(null)
  }

  function startEdit(course: Course) {
    setEditingId(course.id)
    setFormData({
      code: course.code,
      title: course.title,
      description: course.description || "",
      credits: course.credits,
      semester: course.semester,
    })
    setShowForm(true)
  }

  function resetForm() {
    setFormData(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const filteredCourses = courses.filter(
    (c) =>
      `${c.id} ${c.code} ${c.title} ${c.description || ""} ${c.credits} Semester ${c.semester}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  )

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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Course</h3>
              <p className="text-gray-500 mb-2">Are you sure you want to delete <strong>{courses.find(c => c.id === deleteConfirm)?.code} — {courses.find(c => c.id === deleteConfirm)?.title}</strong>?</p>
              <p className="text-red-500 text-sm mb-6">This will also remove all related enrollments. This action cannot be undone.</p>
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
              <h1 className="text-xl font-bold text-gray-900">Courses</h1>
              <span className="badge-blue">{courses.length}</span>
            </div>
            <button
              onClick={() => { showForm && !editingId ? resetForm() : (resetForm(), setShowForm(true)) }}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={showForm && !editingId ? "M6 18L18 6M6 6l12 12" : "M12 4.5v15m7.5-7.5h-15"} />
              </svg>
              {showForm && !editingId ? "Cancel" : "Add Course"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form */}
        {showForm && (
          <div className="card mb-8 border-l-4 border-l-indigo-500">
            <h2 className="text-lg font-semibold mb-6">
              {editingId ? "Edit Course" : "Add New Course"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                  <input type="text" className="input-field" placeholder="e.g., CS101" value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" className="input-field" value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
                  <input type="number" className="input-field" value={formData.credits} min="1" max="6"
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select className="input-field" value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" value={formData.description} rows={3}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className={editingId ? "btn-success" : "btn-primary"}>
                  {editingId ? "Save Changes" : "Add Course"}
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
            <input type="text" placeholder="Search by code, title, semester, description..." className="input-field pl-10"
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
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="text-gray-500 font-medium">No courses found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "Add a course to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Code</th>
                    <th className="table-header">Title</th>
                    <th className="table-header">Credits</th>
                    <th className="table-header">Semester</th>
                    <th className="table-header">Description</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
                          {course.code}
                        </span>
                      </td>
                      <td className="table-cell font-medium text-gray-900">{course.title}</td>
                      <td className="table-cell">{course.credits}</td>
                      <td className="table-cell">
                        <span className="badge-blue">S{course.semester}</span>
                      </td>
                      <td className="table-cell text-gray-500 max-w-xs truncate">{course.description || "—"}</td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(course)}
                            className="btn-icon text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-200" title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteConfirm(course.id)}
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
