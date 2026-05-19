"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import {
  CheckCircle, XCircle, Clock, RefreshCw,
  GitBranch, GitCommitHorizontal, Rocket
} from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  success: {
    color: "text-emerald-400 bg-emerald-400/10",
    icon: CheckCircle,
    label: "Success",
  },
  failed: {
    color: "text-red-400 bg-red-400/10",
    icon: XCircle,
    label: "Failed",
  },
  in_progress: {
    color: "text-amber-400 bg-amber-400/10",
    icon: Clock,
    label: "In progress",
  },
  cancelled: {
    color: "text-zinc-400 bg-zinc-400/10",
    icon: XCircle,
    label: "Cancelled",
  },
  rolled_back: {
    color: "text-orange-400 bg-orange-400/10",
    icon: RefreshCw,
    label: "Rolled back",
  },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.cancelled
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5
                      rounded-full font-mono ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    Promise.all([
      api.get("/deployments/"),
      api.get("/deployments/stats/"),
    ]).then(([depRes, statsRes]) => {
      setDeployments(depRes.data.results || depRes.data)
      setStats(statsRes.data)
    }).catch(() => {
      toast.error("Failed to load deployments")
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <>
      <Topbar
        title="Deployments"
        description="Deployment history and CI/CD logs"
        actions={
          <button onClick={fetchData}
            className="flex items-center gap-1.5 border border-zinc-700
                       hover:border-zinc-500 text-zinc-400 hover:text-white
                       text-xs px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        }
      />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Stats — stack on mobile, row on desktop */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: stats.total, color: "text-white" },
              { label: "Success", value: stats.by_status?.success || 0, color: "text-emerald-400" },
              { label: "Failed", value: stats.by_status?.failed || 0, color: "text-red-400" },
              { label: "In progress", value: stats.by_status?.in_progress || 0, color: "text-amber-400" },
            ].map((stat) => (
              <div key={stat.label}
                className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20">
                <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className={`text-2xl font-medium ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Deployment list */}
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-800/60">
            <p className="text-sm font-medium text-white">Recent deployments</p>
          </div>

          {loading && (
            <div className="px-5 py-8 text-center">
              <p className="text-zinc-600 text-sm font-mono">Loading...</p>
            </div>
          )}

          <div className="divide-y divide-zinc-800/40">
            {deployments.map((dep) => (
              <div key={dep.id}
                className="px-4 sm:px-5 py-4 hover:bg-zinc-800/10 transition-colors">

                {/* Mobile: stacked layout */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-white font-medium">{dep.project_name}</p>
                      <StatusBadge status={dep.status} />
                    </div>
                    {dep.commit_message && (
                      <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-xs sm:max-w-none">
                        {dep.commit_message}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 font-mono shrink-0">
                    {new Date(dep.started_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric",
                    })}
                  </p>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-zinc-600 font-mono">
                    <GitBranch className="w-3 h-3" />
                    {dep.branch}
                  </span>
                  {dep.commit_hash && (
                    <span className="flex items-center gap-1 text-xs text-zinc-600 font-mono">
                      <GitCommitHorizontal className="w-3 h-3" />
                      {dep.commit_hash.slice(0, 7)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-zinc-600 font-mono">
                    <Rocket className="w-3 h-3" />
                    {dep.source.replace("_", " ")}
                  </span>
                  {dep.duration_display && (
                    <span className="text-xs text-zinc-600 font-mono">
                      {dep.duration_display}
                    </span>
                  )}
                  {dep.triggered_by && (
                    <span className="text-xs text-zinc-600 font-mono">
                      by {dep.triggered_by}
                    </span>
                  )}
                </div>

                {dep.error_message && (
                  <div className="mt-2 px-3 py-2 bg-red-500/5 border border-red-500/20
                                  rounded-lg text-xs text-red-400 font-mono">
                    {dep.error_message}
                  </div>
                )}
              </div>
            ))}

            {!loading && !deployments.length && (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-600 text-sm font-mono">No deployments recorded yet</p>
                <p className="text-zinc-700 text-xs font-mono mt-1">
                  Push to main or create one manually
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent failures */}
        {stats?.recent_failed?.length > 0 && (
          <div className="border border-red-500/20 rounded-xl overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <p className="text-sm font-medium text-red-400">Recent failures</p>
              </div>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {stats.recent_failed.map((dep: any) => (
                <div key={dep.id} className="px-4 sm:px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white font-medium">{dep.project_name}</p>
                      <p className="text-xs text-zinc-600 font-mono mt-0.5">
                        {dep.commit_hash?.slice(0, 7)} — {dep.branch}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-600 font-mono shrink-0">
                      {new Date(dep.started_at).toLocaleString()}
                    </p>
                  </div>
                  {dep.error_message && (
                    <p className="text-xs text-red-400/70 font-mono mt-1 truncate">
                      {dep.error_message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
