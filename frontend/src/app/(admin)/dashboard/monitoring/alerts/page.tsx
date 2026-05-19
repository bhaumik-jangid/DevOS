"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

const typeColors: Record<string, string> = {
  downtime: "text-red-400 bg-red-400/10",
  recovery: "text-emerald-400 bg-emerald-400/10",
  contact_form: "text-blue-400 bg-blue-400/10",
  deployment_failure: "text-orange-400 bg-orange-400/10",
  custom: "text-zinc-400 bg-zinc-400/10",
}

export default function AlertHistoryPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/alerts/").then((res) => {
      setAlerts(res.data.results || res.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Topbar title="Alert history" description="All sent notifications" />
      <main className="flex-1 px-6 py-6">
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="divide-y divide-zinc-800/40">
            {loading && (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-600 text-sm font-mono">Loading...</p>
              </div>
            )}
            {!loading && !alerts.length && (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-600 text-sm font-mono">No alerts sent yet</p>
              </div>
            )}
            {alerts.map((alert) => (
              <div key={alert.id}
                className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-zinc-800/10 transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5">
                    {alert.status === "sent"
                      ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                      : alert.status === "failed"
                      ? <XCircle className="w-4 h-4 text-red-400" />
                      : <Clock className="w-4 h-4 text-zinc-600" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{alert.subject}</p>
                    {alert.project_name && (
                      <p className="text-xs text-zinc-600 font-mono">{alert.project_name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono
                                    ${typeColors[alert.alert_type] || typeColors.custom}`}>
                    {alert.alert_type.replace("_", " ")}
                  </span>
                  <p className="text-xs text-zinc-600 font-mono">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
