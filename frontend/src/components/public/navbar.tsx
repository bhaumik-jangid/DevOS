"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Terminal, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
]

export function NavBar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
                          ${scrolled
                            ? "border-b border-zinc-800/80 bg-[#111113]/95 backdrop-blur-md"
                            : "bg-transparent"
                          }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
              <Terminal className="w-3 h-3 text-black" />
            </div>
            <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
              DevOS
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
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

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="sm:hidden p-2 text-zinc-400 hover:text-white transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 left-0 right-0 z-40 bg-[#111113]/98 backdrop-blur-md
                       border-b border-zinc-800/60 sm:hidden">
            <nav className="flex flex-col px-4 py-3 gap-1">
              {links.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    pathname === link.href
                      ? "text-white bg-zinc-800"
                      : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                  }`}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
