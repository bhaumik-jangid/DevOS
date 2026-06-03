"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Terminal, LayoutDashboard, FolderKanban,
  Activity, Layers, LogOut, ChevronRight,
  Bell, Rocket, Menu, X,
  BarChart2,
  Settings2,
  BookOpen
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban, exact: false },
  { href: "/dashboard/deployments", label: "Deployments", icon: Rocket, exact: false },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: Activity, exact: false },
  { href: "/dashboard/monitoring/alerts", label: "Alerts", icon: Bell, exact: false },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: Settings2, exact: false },
  { href: "/dashboard/blog", label: "Blog", icon: BookOpen, exact: false },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Layers, exact: false },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const handleLogout = async () => {
    await logout()
    toast.success("Session terminated")
    router.push("/login")
  }

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link key={item.href} href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                          transition-colors group
                          ${active
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                }`}>
              <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-amber-500" : ""}`} />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-zinc-600" />}
            </Link>
          )
        })}
      </nav>

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
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 h-screen sticky top-0
                        border-r border-zinc-800/60 bg-[#111113] flex-col">
        <div className="px-4 h-14 flex items-center gap-2 border-b border-zinc-800/60">
          <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
            <Terminal className="w-3 h-3 text-black" />
          </div>
          <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">DevOS</span>
        </div>
        <NavLinks />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b
                      border-zinc-800/60 bg-[#111113] flex items-center
                      justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
            <Terminal className="w-3 h-3 text-black" />
          </div>
          <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">DevOS</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-zinc-400 hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 bg-[#111113] border-r border-zinc-800/60
                          flex flex-col h-full">
            <div className="px-4 h-14 flex items-center justify-between
                            border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
                  <Terminal className="w-3 h-3 text-black" />
                </div>
                <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
                  DevOS
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
