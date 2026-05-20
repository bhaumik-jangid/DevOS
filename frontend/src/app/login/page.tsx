"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Loader2, Terminal, Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const isLoading = useAuthStore((s) => s.isLoading)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      toast.success("Authenticated")
      router.push("/dashboard")
    } catch {
      toast.error("Invalid credentials")
    }
  }

  return (
    <div className="min-h-screen bg-[#111113] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-sm">

        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
            <Terminal className="w-4 h-4 text-black" />
          </div>
          <span className="text-white font-mono text-sm tracking-widest uppercase">
            DevOS
          </span>
        </div>

        <h1 className="text-white text-xl font-medium mb-1">Operator access</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Authenticate to enter the dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-mono
                               uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-[#1c1c1e] border border-zinc-800 rounded-lg
                         px-3 py-3 text-white text-sm placeholder-zinc-600
                         focus:outline-none focus:border-amber-500/60
                         focus:ring-1 focus:ring-amber-500/20 transition-colors"
              placeholder="you@domain.dev"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-mono
                               uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-[#1c1c1e] border border-zinc-800 rounded-lg
                           px-3 py-3 pr-10 text-white text-sm placeholder-zinc-600
                           focus:outline-none focus:border-amber-500/60
                           focus:ring-1 focus:ring-amber-500/20 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-zinc-600 hover:text-zinc-400 transition-colors">
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />
                }
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-400
                       disabled:bg-amber-500/40 text-black font-medium
                       text-sm rounded-lg py-3 flex items-center justify-center
                       gap-2 transition-colors duration-150 active:scale-[0.98]
                       mt-2">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Authenticating</>
            ) : (
              "Access dashboard"
            )}
          </button>
        </form>

        <p className="text-zinc-700 text-xs mt-8 font-mono">
          DevOS — restricted access
        </p>
      </motion.div>
    </div>
  )
}
