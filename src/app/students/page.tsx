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

const emptyForm = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  city: "",
  major: "",
  status: "active",
}

export default function StudentsPage() {
  const { data: session, status } = useSession()
  const [students, setStudents] = useState<Student[]>([])
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
    if (session) fetchStudents()
  }, [session])

  async function fetchStudents() {
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      if (editingId) {
        const res = await fetch(`/api/students/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (res.ok) {
          const updated = await res.json()
          setStudents(students.map((s) => (s.id === editingId ? updated : s)))
          showToast("Student updated successfully", "success")
        } else {
          const err = await res.json()
          showToast(err.error || "Failed to update student", "error")
          return
        }
      } else {
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (res.ok) {
          const newStudent = await res.json()
          setStudents([newStudent, ...students])
          showToast("Student added successfully", "success")
        } else {
          const err = await res.json()
          showToast(err.error || "Failed to add student", "error")
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
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" })
      if (res.ok) {
        setStudents(students.filter((s) => s.id !== id))
        showToast("Student deleted successfully", "success")
      } else {
        const err = await res.json()
        showToast(err.error || "Failed to delete student", "error")
      }
    } catch (error) {
      showToast("An error occurred", "error")
    }
    setDeleteConfirm(null)
  }

  function startEdit(student: Student) {
    setEditingId(student.id)
    setFormData({
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone || "",
      city: student.city || "",
      major: student.major || "",
      status: student.status,
    })
    setShowForm(true)
  }

  function resetForm() {
    setFormData(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const filteredStudents = students.filter(
    (s) =>
      `${s.firstName} ${s.lastName} ${s.email} ${s.major || ""} ${s.city || ""}`
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Student</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this student? This action cannot be undone.</p>
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
              <h1 className="text-xl font-bold text-gray-900">Students</h1>
              <span className="badge-purple">{students.length}</span>
            </div>
            <button
              onClick={() => { showForm && !editingId ? resetForm() : (resetForm(), setShowForm(true)) }}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={showForm && !editingId ? "M6 18L18 6M6 6l12 12" : "M12 4.5v15m7.5-7.5h-15"} />
              </svg>
              {showForm && !editingId ? "Cancel" : "Add Student"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form */}
        {showForm && (
          <div className="card mb-8 border-l-4 border-l-indigo-500">
            <h2 className="text-lg font-semibold mb-6">
              {editingId ? "Edit Student" : "Add New Student"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" className="input-field" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" className="input-field" value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" className="input-field" value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" className="input-field" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" className="input-field" value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                  <input type="text" className="input-field" value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })} />
                </div>
                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select className="input-field" value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="graduated">Graduated</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className={editingId ? "btn-success" : "btn-primary"}>
                  {editingId ? "Save Changes" : "Add Student"}
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
            <input
              type="text"
              placeholder="Search students..."
              className="input-field pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No students found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery ? "Try a different search term" : "Add a student to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Phone</th>
                    <th className="table-header">City</th>
                    <th className="table-header">Major</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="table-cell">{student.email}</td>
                      <td className="table-cell">{student.phone || "—"}</td>
                      <td className="table-cell">{student.city || "—"}</td>
                      <td className="table-cell">{student.major || "—"}</td>
                      <td className="table-cell">
                        <span className={
                          student.status === "active" ? "badge-green" :
                          student.status === "graduated" ? "badge-blue" : "badge-red"
                        }>
                          {student.status}
                        </span>
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(student)}
                            className="btn-icon text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-200"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(student.id)}
                            className="btn-icon text-red-600 hover:bg-red-50 focus:ring-red-200"
                            title="Delete"
                          >
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
