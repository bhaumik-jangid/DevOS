"use client"

import { Activity, ExternalLink, LayoutGrid } from "lucide-react"

interface TopbarProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function Topbar({ title, description, actions }: TopbarProps) {
  const BACKEND =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
    "http://localhost:8090"

  return (
    <div
      className="border-b border-zinc-800/60 px-4 sm:px-6 py-3 sm:py-0
      sm:h-14 flex flex-col sm:flex-row sm:items-center
      justify-between gap-2 shrink-0"
    >
      <div>
        <h1 className="text-sm font-medium text-white">{title}</h1>
        {description && (
          <p className="text-xs text-zinc-600">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="hidden sm:flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-500" />
          <span className="text-xs text-zinc-600 font-mono">
            Operational
          </span>
        </div>

        <div className="w-px h-4 bg-zinc-800 hidden sm:block" />

        {/* Portfolio Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-zinc-500
          hover:text-white transition-colors px-2 py-1
          rounded hover:bg-zinc-800"
        >
          <ExternalLink className="w-3 h-3" />
          <span className="hidden sm:inline">Portfolio</span>
        </a>

        {/* Django Admin Link */}
        <a
          href={`${BACKEND}/admin/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-zinc-500
          hover:text-white transition-colors px-2 py-1
          rounded hover:bg-zinc-800"
        >
          <LayoutGrid className="w-3 h-3" />
          <span className="hidden sm:inline">Django Admin</span>
        </a>

        {actions && (
          <>
            <div className="w-px h-4 bg-zinc-800 hidden sm:block" />
            {actions}
          </>
        )}
      </div>
    </div>
  )
}