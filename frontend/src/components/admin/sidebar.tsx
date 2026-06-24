"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Terminal, LayoutDashboard, FolderGit2, Activity,
  Layers, LogOut, ChevronRight, Rocket,
  BarChart2, MessageSquare, BookOpen, Cpu, Bot,
  Settings, Link2, Tv, X, Menu
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { api } from "@/lib/api"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  service?: string
  exact?: boolean
}

const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/projects", label: "Projects", icon: FolderGit2, service: "projects" },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: Activity, service: "projects" },
  { href: "/dashboard/deployments", label: "Deployments", icon: Rocket, service: "projects" },
  { href: "/dashboard/blog", label: "Blog", icon: BookOpen, service: "portfolio" },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Layers, service: "portfolio" },
  { href: "/dashboard/contacts", label: "Contacts", icon: MessageSquare, service: "portfolio" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/shortener", label: "URL Shortener", icon: Link2, service: "shortener" },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Tv, service: "watchlist" },
  { href: "/dashboard/mcp", label: "MCP Tools", icon: Cpu, service: "mcp" },
  { href: "/dashboard/assistant", label: "AI Assistant", icon: Bot, service: "mcp" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [enabledServices, setEnabledServices] = useState<string[]>([
    "portfolio", "projects", "shortener", "watchlist", "mcp"
  ])

  useEffect(() => {
    api.get("/core/services/").then((res) => {
      if (res.data.enabled?.length) {
        setEnabledServices(res.data.enabled)
      }
    }).catch(() => { })
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const visibleItems = ALL_NAV_ITEMS.filter((item) =>
    !item.service || enabledServices.includes(item.service)
  )

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-zinc-800/60">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center shrink-0">
            <Terminal className="w-3 h-3 text-black" />
          </div>
          <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
            DevOS
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                           transition-colors group
                           ${active
                             ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                             : "text-zinc-500 hover:text-white hover:bg-zinc-800/40"
                           }`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {active && (
                <ChevronRight className="w-3 h-3 ml-auto text-amber-500/60" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom — Settings + Logout */}
      <div className="px-2 py-3 border-t border-zinc-800/60 space-y-0.5">
        <Link href="/dashboard/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                       transition-colors
                       ${pathname.startsWith("/dashboard/settings")
                         ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                         : "text-zinc-500 hover:text-white hover:bg-zinc-800/40"
                       }`}>
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                     text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-colors">
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 shrink-0 border-r border-zinc-800/60
                         bg-[#0e0e10] flex-col h-screen sticky top-0">
        {navContent}
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40
                       border-b border-zinc-800/60 bg-[#0e0e10]/95 backdrop-blur-md
                       flex items-center justify-between px-4 h-14">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
            <Terminal className="w-3 h-3 text-black" />
          </div>
          <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
            DevOS
          </span>
        </Link>
        <button onClick={() => setMobileOpen((v) => !v)}
          className="p-2 text-zinc-400 hover:text-white transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-64
                         bg-[#0e0e10] border-r border-zinc-800/60 md:hidden">
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
