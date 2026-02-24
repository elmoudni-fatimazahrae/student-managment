"use client"

import Link from "next/link"

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 px-4">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-6">
          Sorry, something went wrong during authentication. Please try again.
        </p>
        <Link href="/auth/signin" className="btn-primary">
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
