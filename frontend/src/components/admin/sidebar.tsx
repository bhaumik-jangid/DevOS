"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Terminal, LayoutDashboard, FolderKanban,
  Activity, Layers, LogOut, ChevronRight
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban, exact: false },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Layers, exact: false },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: Activity, exact: false },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const handleLogout = async () => {
    await logout()
    toast.success("Session terminated")
    router.push("/login")
  }

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 border-r border-zinc-800/60
                      bg-[#111113] flex flex-col">

      {/* Logo */}
      <div className="px-4 h-14 flex items-center gap-2 border-b border-zinc-800/60">
        <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
          <Terminal className="w-3 h-3 text-black" />
        </div>
        <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">DevOS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                          transition-colors group relative
                          ${active
                            ? "bg-zinc-800 text-white"
                            : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                          }`}>
              <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-amber-500" : ""}`} />
              {item.label}
              {active && (
                <ChevronRight className="w-3 h-3 ml-auto text-zinc-600" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-2 py-3 border-t border-zinc-800/60">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-white truncate">{user?.username || "operator"}</p>
          <p className="text-xs text-zinc-600 truncate">{user?.email}</p>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                     text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
