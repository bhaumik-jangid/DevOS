import Link from "next/link"
import { Terminal, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#111113] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl
                        flex items-center justify-center mx-auto mb-6">
          <Terminal className="w-5 h-5 text-amber-500" />
        </div>
        <p className="text-amber-500 font-mono text-sm mb-2">404</p>
        <h1 className="text-2xl font-medium text-white mb-3">Page not found</h1>
        <p className="text-zinc-500 text-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white
                     text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  )
}
