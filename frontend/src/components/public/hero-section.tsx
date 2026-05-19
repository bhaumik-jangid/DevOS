import Link from "next/link"
import { ArrowRight, GitBranch, Share, FileText } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-zinc-500 font-mono">Available for opportunities</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-medium text-white leading-tight mb-4">
          Full-stack engineer.<br />
          <span className="text-zinc-500">Building systems that scale.</span>
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-xl">
          I design and build production-grade web applications, APIs, and developer tooling.
          Currently focused on DevOps-integrated full-stack development.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/projects"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium px-4 py-2.5 rounded-lg transition-colors duration-150">
            View projects
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="mailto:you@domain.dev"
            className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm px-4 py-2.5 rounded-lg transition-colors duration-150">
            <FileText className="w-4 h-4" />
            Contact me
          </a>
        </div>
        <div className="flex items-center gap-4 mt-8 pt-8 border-t border-zinc-800/50">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors">
            <GitBranch className="w-4 h-4" />GitHub
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors">
            <Share className="w-4 h-4" />LinkedIn
          </a>
        </div>
      </div>
    </section>
  )
}
