"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LogOut, Terminal, Activity } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, fetchMe } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchMe()
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success("Session terminated")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-[#111113] text-white">

      {/* Top bar */}
      <header className="border-b border-zinc-800/60 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
            <Terminal className="w-3 h-3 text-black" />
          </div>
          <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">DevOS</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-zinc-500 font-mono">Systems operational</span>
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <span className="text-xs text-zinc-500">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white
                       transition-colors px-2 py-1 rounded hover:bg-zinc-800"
          >
            <LogOut className="w-3 h-3" />
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="px-6 py-8">
        <h1 className="text-lg font-medium text-white mb-1">
          Good to have you back, {user?.username || "operator"}
        </h1>
        <p className="text-zinc-500 text-sm">Dashboard is being constructed. Phase 5 incoming.</p>
      </main>
    </div>
  )
}