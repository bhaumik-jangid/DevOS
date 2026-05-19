"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import {
  RefreshCw, CheckCircle, XCircle,
  AlertTriangle, Clock, Wifi
} from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

interface ProjectStatus {
  project_id: number
  project_name: string
  project_slug: string
  has_health_endpoint: boolean
  uptime_percent: number | null
  open_incident: any | null
  latest_check: {
    status: string
    status_code: number | null
    latency_ms: number | null
    is_healthy: boolean
    checked_at: string
    error_message: string
  } | null
}

function StatusIcon({ status, size = "sm" }: { status: string, size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5"
  if (status === "healthy") return <CheckCircle className={`${cls} text-emerald-500`} />
  if (status === "timeout") return <Clock className={`${cls} text-amber-500`} />
  if (status === "unhealthy") return <XCircle className={`${cls} text-red-400`} />
  if (status === "error") return <AlertTriangle className={`${cls} text-red-400`} />
  return <Wifi className={`${cls} text-zinc-600`} />
}

function UptimeBar({ percent }: { percent: number | null }) {
  if (percent === null) return <span className="text-xs text-zinc-600 font-mono">No data</span>
  const color = percent >= 99 ? "bg-emerald-500" : percent >= 95 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className={`text-xs font-mono ${
        percent >= 99 ? "text-emerald-500" : percent >= 95 ? "text-amber-400" : "text-red-400"
      }`}>
        {percent}%
      </span>
    </div>
  )
}

export default function MonitoringPage() {
  const [statuses, setStatuses] = useState<ProjectStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)

  const fetchStatus = useCallback(() => {
    api.get("/monitoring/status/").then((res) => {
      setStatuses(res.data)
    }).catch(() => {
      toast.error("Failed to load monitoring data")
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchStatus()
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const triggerAll = async () => {
    setTriggering(true)
    try {
      const res = await api.post("/monitoring/trigger/")
      toast.success(
        `Checks complete — ${res.data.healthy} healthy, ${res.data.unhealthy} unhealthy`
      )
      fetchStatus()
    } catch {
      toast.error("Failed to trigger health checks")
    } finally {
      setTriggering(false)
    }
  }

  const triggerOne = async (projectId: number, name: string) => {
    try {
      await api.post(`/monitoring/trigger/${projectId}/`)
      toast.success(`${name} checked`)
      fetchStatus()
    } catch {
      toast.error(`Failed to check ${name}`)
    }
  }

  const healthy = statuses.filter((s) => s.latest_check?.is_healthy).length
  const unhealthy = statuses.filter(
    (s) => s.has_health_endpoint && s.latest_check && !s.latest_check.is_healthy
  ).length
  const noEndpoint = statuses.filter((s) => !s.has_health_endpoint).length

  return (
    <>
      <Topbar
        title="Monitoring"
        description="Project health and uptime"
        actions={
          <button
            onClick={triggerAll}
            disabled={triggering}
            className="flex items-center gap-1.5 border border-zinc-700 hover:border-zinc-500
                       text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg
                       transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${triggering ? "animate-spin" : ""}`} />
            Run checks
          </button>
        }
      />

      <main className="flex-1 px-6 py-6 space-y-6">

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Healthy</p>
            </div>
            <p className="text-2xl font-medium text-white">{healthy}</p>
          </div>
          <div className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Unhealthy</p>
            </div>
            <p className="text-2xl font-medium text-white">{unhealthy}</p>
          </div>
          <div className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20">
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-3.5 h-3.5 text-zinc-600" />
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">No endpoint</p>
            </div>
            <p className="text-2xl font-medium text-white">{noEndpoint}</p>
          </div>
        </div>

        {/* Project status table */}
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800/60">
            <p className="text-sm font-medium text-white">Project status</p>
          </div>

          {loading && (
            <div className="px-5 py-8 text-center">
              <p className="text-zinc-600 text-sm font-mono">Loading...</p>
            </div>
          )}

          <div className="divide-y divide-zinc-800/40">
            {statuses.map((s) => (
              <div key={s.project_id}
                className="px-5 py-4 flex items-center justify-between hover:bg-zinc-800/10 transition-colors">

                <div className="flex items-center gap-3 min-w-0">
                  <StatusIcon
                    status={s.latest_check?.status || (s.has_health_endpoint ? "error" : "none")}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium">{s.project_name}</p>
                    <p className="text-xs text-zinc-600 font-mono truncate">
                      {s.has_health_endpoint
                        ? s.latest_check
                          ? `Last checked ${new Date(s.latest_check.checked_at).toLocaleTimeString()}`
                          : "Never checked"
                        : "No health endpoint configured"
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  {s.latest_check && (
                    <>
                      <div className="text-right">
                        <p className="text-xs text-zinc-600 font-mono">Latency</p>
                        <p className={`text-sm font-mono ${
                          s.latest_check.latency_ms && s.latest_check.latency_ms > 1000
                            ? "text-amber-400"
                            : "text-zinc-300"
                        }`}>
                          {s.latest_check.latency_ms}ms
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-600 font-mono mb-1">Uptime (30 checks)</p>
                        <UptimeBar percent={s.uptime_percent} />
                      </div>
                    </>
                  )}

                  {s.open_incident && (
                    <span className="text-xs px-2 py-0.5 rounded-full
                                     bg-red-500/10 text-red-400 font-mono">
                      Incident open
                    </span>
                  )}

                  {s.has_health_endpoint && (
                    <button
                      onClick={() => triggerOne(s.project_id, s.project_name)}
                      className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600
                                 hover:text-white transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open incidents */}
        <OpenIncidents />
      </main>
    </>
  )
}

function OpenIncidents() {
  const [incidents, setIncidents] = useState<any[]>([])

  useEffect(() => {
    api.get("/monitoring/incidents/?open=true").then((res) => {
      setIncidents(res.data.results || res.data)
    })
  }, [])

  if (!incidents.length) return null

  return (
    <div className="border border-red-500/20 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <p className="text-sm font-medium text-red-400">Open incidents</p>
        </div>
      </div>
      <div className="divide-y divide-zinc-800/40">
        {incidents.map((incident) => (
          <div key={incident.id} className="px-5 py-3.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white font-medium">{incident.project_name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{incident.description}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                  incident.severity === "critical" ? "bg-red-500/20 text-red-400" :
                  incident.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                  "bg-amber-500/20 text-amber-400"
                }`}>
                  {incident.severity}
                </span>
                <p className="text-xs text-zinc-600 font-mono mt-1">
                  {new Date(incident.started_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
