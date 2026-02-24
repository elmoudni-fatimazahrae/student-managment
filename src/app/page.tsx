import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 px-4">
      <div className="text-center text-white max-w-2xl">
        <h1 className="text-5xl font-bold mb-6">Student Management System</h1>
        <p className="text-xl mb-8 opacity-90">
          A complete solution for managing student information, courses, and enrollments.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/auth/signin"
            className="btn-primary bg-white text-blue-600 font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
