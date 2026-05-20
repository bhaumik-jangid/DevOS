"use client"

import { Activity } from "lucide-react"

interface TopbarProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function Topbar({ title, description, actions }: TopbarProps) {
  return (
    <div className="border-b border-zinc-800/60 px-4 sm:px-6 py-3 sm:py-0
                    sm:h-14 flex flex-col sm:flex-row sm:items-center
                    justify-between gap-2 shrink-0">
      <div>
        <h1 className="text-sm font-medium text-white">{title}</h1>
        {description && (
          <p className="text-xs text-zinc-600">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-500" />
          <span className="text-xs text-zinc-600 font-mono">Operational</span>
        </div>
        {actions}
      </div>
    </div>
  )
}
