import { GitBranch, Share, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 mt-24">
      <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <p className="text-zinc-600 text-xs font-mono">Built with DevOS</p>
        <div className="flex items-center gap-3">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="text-zinc-600 hover:text-white transition-colors">
            <GitBranch className="w-4 h-4" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
            className="text-zinc-600 hover:text-white transition-colors">
            <Share className="w-4 h-4" />
          </a>
          <a href="mailto:you@domain.dev"
            className="text-zinc-600 hover:text-white transition-colors">
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
