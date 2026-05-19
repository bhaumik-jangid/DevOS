"use client"

import { useEffect, useState } from "react"
import { FolderKanban, Activity, CheckCircle, Clock } from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { StatCard } from "@/components/admin/stat-card"
import { api } from "@/lib/api"

interface Stats {
  total_projects: number
  active_projects: number
  featured_projects: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    api.get("/projects/").then((res) => {
      const results = res.data.results || res.data
      setProjects(results)
      setStats({
        total_projects: results.length,
        active_projects: results.filter((p: any) => p.status === "active").length,
        featured_projects: results.filter((p: any) => p.is_featured).length,
      })
    }).catch(() => {})
  }, [])

  return (
    <>
      <Topbar title="Overview" description="System status and project summary" />
      <main className="flex-1 px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total projects"
            value={stats?.total_projects ?? "—"}
            icon={FolderKanban}
          />
          <StatCard
            label="Active"
            value={stats?.active_projects ?? "—"}
            icon={CheckCircle}
            trend="Running in production"
            trendUp
          />
          <StatCard
            label="Featured"
            value={stats?.featured_projects ?? "—"}
            icon={Activity}
          />
          <StatCard
            label="Stack"
            value="Django + Next"
            icon={Clock}
          />
        </div>

        {/* Recent projects table */}
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800/60 flex items-center justify-between">
            <p className="text-sm font-medium text-white">Projects</p>
            <span className="text-xs text-zinc-600 font-mono">{projects.length} total</span>
          </div>
          <div className="divide-y divide-zinc-800/40">
            {projects.map((project) => (
              <div key={project.id}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    project.status === "active" ? "bg-emerald-500" :
                    project.status === "in_progress" ? "bg-amber-500" : "bg-zinc-600"
                  }`} />
                  <div>
                    <p className="text-sm text-white">{project.name}</p>
                    <p className="text-xs text-zinc-600 font-mono">{project.hosting_provider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 flex-wrap justify-end">
                    {project.stack_tags.slice(0, 3).map((tag: string) => (
                      <span key={tag}
                        className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono shrink-0 ${
                    project.status === "active" ? "text-emerald-400 bg-emerald-400/10" :
                    project.status === "in_progress" ? "text-amber-400 bg-amber-400/10" :
                    "text-zinc-400 bg-zinc-400/10"
                  }`}>
                    {project.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
            {!projects.length && (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-600 text-sm font-mono">No projects found</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </>
  )
}
