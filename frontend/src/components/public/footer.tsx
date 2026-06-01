import Link from "next/link"
import { GitBranch, ExternalLink, Mail, Terminal, Bird } from "lucide-react"
import { BackToTop } from "@/components/public/back-to-top";

interface FooterProps {
  config: Record<string, string>
}

export function Footer({ config }: FooterProps) {
  return (
    <footer className="border-t border-zinc-800/50 mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-8">

        {/* Top section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
                <Terminal className="w-3 h-3 text-black" />
              </div>
              <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
                DevOS
              </span>
            </div>
            <p className="text-zinc-600 text-xs leading-relaxed max-w-48">
              Full-stack engineer building production-grade systems and developer tooling.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-3">
              Navigation
            </p>
            <div className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/projects", label: "Projects" },
                { href: "/blog", label: "Blog" },
                { href: "/#contact", label: "Contact" },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="block text-sm text-zinc-600 hover:text-zinc-300
                             transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-3">
              Connect
            </p>
            <div className="space-y-2">
              {config.github_url && (
                <a href={config.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-600
                             hover:text-zinc-300 transition-colors">
                  <GitBranch className="w-3.5 h-3.5" />
                  GitHub
                </a>
              )}
              {config.linkedin_url && (
                <a href={config.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-600
                             hover:text-zinc-300 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              )}
              {config.twitter_url && (
                <a href={config.twitter_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-600
                             hover:text-zinc-300 transition-colors">
                  <Bird className="w-3.5 h-3.5" />
                  Twitter / X
                </a>
              )}
              {config.email && (
                <a href={`mailto:${config.email}`}
                  className="flex items-center gap-2 text-sm text-zinc-600
                             hover:text-zinc-300 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  {config.email}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800/50 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Hidden dashboard login — same color as background text */}
            <Link href="/login"
              className="text-zinc-800 hover:text-zinc-700 text-xs font-mono
                         transition-colors">
              © {new Date().getFullYear()} DevOS
            </Link>
            <span className="text-zinc-800 text-xs">·</span>
            <span className="text-zinc-700 text-xs font-mono">
              Built with Django + Next.js
            </span>
          </div>

          <BackToTop />
        </div>
      </div>
    </footer>
  )
}
