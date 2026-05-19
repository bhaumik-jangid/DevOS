import { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
}

export function StatCard({ label, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="border border-zinc-800/60 rounded-xl p-5 bg-zinc-900/20">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-zinc-400" />
        </div>
      </div>
      <p className="text-2xl font-medium text-white mb-1">{value}</p>
      {trend && (
        <p className={`text-xs font-mono ${trendUp ? "text-emerald-500" : "text-zinc-600"}`}>
          {trend}
        </p>
      )}
    </div>
  )
}
