"use client"

import { signIn } from "next-auth/react"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

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
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(result.error === "CredentialsSignin"
        ? "Invalid email or password"
        : `Authentication error: ${result.error}`)
    } else if (result?.ok) {
      router.push("/dashboard")
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: "url('/esisa-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0a1a3a]/60" />

      {/* Glassmorphism card */}
      <div className="relative z-10 max-w-md w-full rounded-2xl p-8 shadow-2xl border border-white/20"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Logo / School name */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: "linear-gradient(135deg, #d4a017, #f5c542)" }}
          >
            <svg className="w-8 h-8 text-[#0a1a3a]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">ESISA</h1>
          <p className="text-sm mt-1" style={{ color: "#f5c542" }}>
            Espace de connexion
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-white/90">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-3 rounded-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#f5c542] focus:border-transparent transition-all"
              style={{ background: "rgba(255, 255, 255, 0.08)" }}
              required
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-white/90">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-3 rounded-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#f5c542] focus:border-transparent transition-all"
              style={{ background: "rgba(255, 255, 255, 0.08)" }}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-lg tracking-wide transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #d4a017, #f5c542)",
              color: "#0a1a3a",
            }}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-white/50 text-xs mb-1">Identifiants de démonstration</p>
          <p className="text-white/70 text-sm">admin@example.com / password123</p>
        </div>
      </div>
    </div>
  )
}
