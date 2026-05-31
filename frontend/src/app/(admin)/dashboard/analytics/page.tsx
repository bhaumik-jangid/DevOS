"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Eye, TrendingUp, FileText, Clock } from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { StatCard } from "@/components/admin/stat-card"
import { api } from "@/lib/api"
import { staggerContainer, staggerItem } from "@/lib/animations"

interface AnalyticsData {
  total_views: number
  views_30d: number
  views_7d: number
  top_pages: { path: string; count: number }[]
  daily_chart: { date: string; count: number }[]
  recent: { path: string; referrer: string; viewed_at: string }[]
}

function SimpleBarChart({ data }: { data: { date: string; count: number }[] }) {
  if (!data.length) return null
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="flex items-end gap-0.5 h-16 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
          <div
            className="w-full bg-amber-500/60 hover:bg-amber-500 rounded-sm transition-colors"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: "2px" }}
          />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-800
                          text-white text-xs px-1.5 py-0.5 rounded opacity-0
                          group-hover:opacity-100 transition-opacity whitespace-nowrap
                          pointer-events-none z-10">
            {d.count}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/core/analytics/").then((res) => {
      setData(res.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Topbar title="Analytics" description="Page views and visitor stats" />
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Stat cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              label: "Total views",
              value: data?.total_views ?? "—",
              icon: Eye,
            },
            {
              label: "Last 30 days",
              value: data?.views_30d ?? "—",
              icon: TrendingUp,
              trend: "vs all time",
            },
            {
              label: "Last 7 days",
              value: data?.views_7d ?? "—",
              icon: Clock,
            },
          ].map((stat) => (
            <motion.div key={stat.label} variants={staggerItem}>
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Chart + top pages side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Daily chart */}
          <div className="border border-zinc-800/60 rounded-xl p-5 bg-zinc-900/20">
            <p className="text-sm font-medium text-white mb-4">
              Daily views — last 30 days
            </p>
            {loading ? (
              <div className="h-16 bg-zinc-800/40 rounded animate-pulse" />
            ) : (
              <SimpleBarChart data={data?.daily_chart || []} />
            )}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-zinc-600 font-mono">
                {data?.daily_chart[0]?.date || ""}
              </p>
              <p className="text-xs text-zinc-600 font-mono">
                {data?.daily_chart[data.daily_chart.length - 1]?.date || ""}
              </p>
            </div>
          </div>

          {/* Top pages */}
          <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-800/60">
              <p className="text-sm font-medium text-white">Top pages</p>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {loading && (
                <div className="px-5 py-4 text-center">
                  <p className="text-zinc-600 text-sm font-mono">Loading...</p>
                </div>
              )}
              {data?.top_pages.map((page, i) => (
                <div key={page.path}
                  className="px-5 py-3 flex items-center justify-between
                             hover:bg-zinc-800/10 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-zinc-700 font-mono w-4 shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <p className="text-sm text-zinc-300 font-mono truncate">
                        {page.path}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-amber-500 shrink-0 ml-3">
                    {page.count}
                  </span>
                </div>
              ))}
              {!loading && !data?.top_pages.length && (
                <div className="px-5 py-6 text-center">
                  <p className="text-zinc-600 text-sm font-mono">No views yet</p>
                  <p className="text-zinc-700 text-xs font-mono mt-1">
                    Visit the public portfolio to generate data
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800/60">
            <p className="text-sm font-medium text-white">Recent activity</p>
          </div>
          <div className="divide-y divide-zinc-800/40">
            {data?.recent.map((view, i) => (
              <div key={i}
                className="px-5 py-3 flex items-center justify-between
                           hover:bg-zinc-800/10 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Eye className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <p className="text-sm text-zinc-300 font-mono truncate">
                    {view.path}
                  </p>
                </div>
                <p className="text-xs text-zinc-600 font-mono shrink-0 ml-3">
                  {new Date(view.viewed_at).toLocaleTimeString()}
                </p>
              </div>
            ))}
            {!loading && !data?.recent.length && (
              <div className="px-5 py-6 text-center">
                <p className="text-zinc-600 text-sm font-mono">No activity yet</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </>
  )
}
