import { Mail, GitBranch, ExternalLink } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center
                        justify-between gap-4">
          <div>
            <p className="text-zinc-600 text-xs font-mono">
              Built with DevOS — personal ops platform
            </p>
            {/* Hidden dashboard link — same color as surrounding text,
                no underline, not visible at first glance */}
            <Link
              href="/login"
              className="text-zinc-800 hover:text-zinc-600 text-xs font-mono
                         transition-colors no-underline mt-0.5 inline-block">
              © 2025
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="text-zinc-600 hover:text-white transition-colors">
              <GitBranch className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
              className="text-zinc-600 hover:text-white transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
            <a href="mailto:you@domain.dev"
              className="text-zinc-600 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
