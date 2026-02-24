"use client"

import { signIn } from "next-auth/react"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignIn() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Invalid credentials")
    } else if (result?.ok) {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Sign In
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="input-field"
              required
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="input-field"
              required
              placeholder="password123"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full font-semibold disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600 text-center">
          <p className="mb-2">Demo credentials:</p>
          <p>Email: admin@example.com</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  )
}
