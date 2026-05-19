"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Terminal } from "lucide-react"

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
]

export function NavBar() {
  const pathname = usePathname()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-[#111113]/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
            <Terminal className="w-3 h-3 text-black" />
          </div>
          <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">DevOS</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                pathname === link.href
                  ? "text-white bg-zinc-800"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
              }`}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
