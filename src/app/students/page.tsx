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
  const [statusFilter, setStatusFilter] = useState("all")

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
          showToast("Modifié avec succès", "success")
        } else {
          const err = await res.json()
          showToast(err.error || "Échec de la modification", "error")
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
          showToast("Ajouté avec succès", "success")
        } else {
          const err = await res.json()
          showToast(err.error || "Échec de l'ajout", "error")
          return
        }
      }
      resetForm()
    } catch {
      showToast("Une erreur est survenue", "error")
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" })
      if (res.ok) {
        setStudents(students.filter((s) => s.id !== id))
        showToast("Supprimé avec succès", "error")
      } else {
        const err = await res.json()
        showToast(err.error || "Échec de la suppression", "error")
      }
    } catch {
      showToast("Une erreur est survenue", "error")
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

  const filteredStudents = students.filter((s) => {
    const matchesSearch = `${s.id} ${s.firstName} ${s.lastName} ${s.email} ${s.phone || ""} ${s.major || ""} ${s.city || ""} ${s.status}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#003366] border-t-[#FFD700] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-[slideIn_0.3s_ease-out]">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {toast.type === "success" ? (
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-5">
                <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Supprimer l&apos;étudiant</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Voulez-vous vraiment supprimer <span className="font-semibold text-gray-900">
                  {students.find(s => s.id === deleteConfirm)?.firstName} {students.find(s => s.id === deleteConfirm)?.lastName}
                </span> ? Cette action est irréversible.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header / Navigation */}
      <header className="bg-[#003366] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-white/70 hover:text-[#FFD700] transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Dashboard
              </Link>
              <div className="h-6 w-px bg-white/20"></div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFD700] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#003366]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Gestion des Étudiants</h1>
                  <p className="text-white/50 text-xs">{students.length} étudiant{students.length !== 1 ? "s" : ""} enregistré{students.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar — single row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFD700]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-all shadow-sm appearance-none cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
            </select>
          </div>

          {/* Add Student Button */}
          <button
            onClick={() => { showForm && !editingId ? resetForm() : (resetForm(), setShowForm(true)) }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            style={{
              backgroundColor: showForm && !editingId ? "#6b7280" : "#003366",
              color: showForm && !editingId ? "#ffffff" : "#FFD700",
            }}
          >
            {showForm && !editingId ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Ajouter Étudiant
              </>
            )}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100" style={{ backgroundColor: "#003366" }}>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[#FFD700]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={editingId
                    ? "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    : "M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                  } />
                </svg>
                {editingId ? "Modifier l'étudiant" : "Nouvel étudiant"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input type="email" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-all" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-all" value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required placeholder="Prénom" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-all" value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required placeholder="Nom de famille" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
                  <input type="tel" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-all" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+212 6XX XXX XXX" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ville</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-all" value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Ville" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Filière</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-all" value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })} placeholder="Génie Informatique" />
                </div>
                {editingId && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Statut</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-all" value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="graduated">Graduated</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-md active:scale-[0.98]"
                  style={{ backgroundColor: "#003366", color: "#FFD700" }}
                >
                  {editingId ? "Enregistrer" : "Ajouter"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="text-gray-900 font-semibold text-lg">Aucun étudiant trouvé</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery ? `Aucun résultat pour "${searchQuery}".` : "Ajoutez un étudiant pour commencer."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#003366" }}>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-white/90 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-white/90 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-white/90 uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-white/90 uppercase tracking-wider">Ville</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-white/90 uppercase tracking-wider">Filière</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-white/90 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-white/90 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-[#003366]/[0.02] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#003366" }}>
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.phone || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.city || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.major || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : student.status === "graduated" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Graduated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(student)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#003366] hover:bg-[#003366]/10 transition-colors"
                            title="Modifier"
                          >
                            <svg className="w-4 h-4 text-[#FFD700]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Modifier
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(student.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer with count */}
          {!loading && filteredStudents.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {filteredStudents.length} étudiant{filteredStudents.length !== 1 ? "s" : ""} affiché{filteredStudents.length !== 1 ? "s" : ""}
                {statusFilter !== "all" && ` (filtre: ${statusFilter})`}
              </p>
              <p className="text-xs text-gray-400">Total : {students.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
