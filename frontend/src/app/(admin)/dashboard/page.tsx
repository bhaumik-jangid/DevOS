"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  FolderKanban, CheckCircle, Activity,
  Rocket, ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { Topbar } from "@/components/admin/topbar"
import { StatCard } from "@/components/admin/stat-card"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { staggerContainer, staggerItem } from "@/lib/animations"

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<any[]>([])
  const [deploymentStats, setDeploymentStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/projects/"),
      api.get("/deployments/stats/"),
    ]).then(([pRes, dRes]) => {
      setProjects(pRes.data.results || pRes.data)
      setDeploymentStats(dRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const active = projects.filter((p) => p.status === "active").length
  const featured = projects.filter((p) => p.is_featured).length

  return (
    <>
      <Topbar
        title="Overview"
        description={`Welcome back, ${user?.username || "operator"}`}
      />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Stat cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total projects", value: projects.length, icon: FolderKanban },
            { label: "Active", value: active, icon: CheckCircle, trend: "In production", trendUp: true },
            { label: "Deployments", value: deploymentStats?.total ?? "—", icon: Rocket },
            { label: "Failed deploys", value: deploymentStats?.by_status?.failed ?? 0, icon: Activity },
          ].map((stat) => (
            <motion.div key={stat.label} variants={staggerItem}>
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Projects table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="border border-zinc-800/60 rounded-xl overflow-hidden">

          <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-800/60
                          flex items-center justify-between">
            <p className="text-sm font-medium text-white">Projects</p>
            <Link href="/dashboard/projects"
              className="text-xs text-zinc-500 hover:text-white transition-colors
                         flex items-center gap-1">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/40">
            {loading && (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-600 text-sm font-mono">Loading...</p>
              </div>
            )}
            {projects.map((project) => (
              <div key={project.id}
                className="px-4 sm:px-5 py-3.5 flex items-center justify-between
                           hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    project.status === "active" ? "bg-emerald-500" :
                    project.status === "in_progress" ? "bg-amber-500" : "bg-zinc-600"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{project.name}</p>
                    <p className="text-xs text-zinc-600 font-mono hidden sm:block">
                      {project.hosting_provider}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <div className="hidden sm:flex gap-1">
                    {project.stack_tags.slice(0, 3).map((tag: string) => (
                      <span key={tag}
                        className="text-xs px-1.5 py-0.5 rounded bg-zinc-800
                                   text-zinc-500 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                    project.status === "active"
                      ? "text-emerald-400 bg-emerald-400/10"
                      : project.status === "in_progress"
                      ? "text-amber-400 bg-amber-400/10"
                      : "text-zinc-400 bg-zinc-400/10"
                  }`}>
                    {project.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent failures */}
        {deploymentStats?.recent_failed?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="border border-red-500/20 rounded-xl overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-red-500/20 bg-red-500/5">
              <p className="text-sm font-medium text-red-400">Recent deployment failures</p>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {deploymentStats.recent_failed.map((dep: any) => (
                <div key={dep.id} className="px-4 sm:px-5 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white">{dep.project_name}</p>
                    <p className="text-xs text-zinc-600 font-mono">
                      {new Date(dep.started_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-600 font-mono mt-0.5">
                    {dep.commit_hash?.slice(0, 7)} — {dep.branch}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </>
  )
}
