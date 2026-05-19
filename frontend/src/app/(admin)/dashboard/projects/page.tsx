"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Plus, ArrowUpRight, GitBranch, Pencil, Trash2 } from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = () => {
    api.get("/projects/").then((res) => {
      setProjects(res.data.results || res.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/projects/${id}/`)
      toast.success(`"${name}" deleted`)
      fetchProjects()
    } catch {
      toast.error("Failed to delete project")
    }
  }

  return (
    <>
      <Topbar
        title="Projects"
        description="Manage your project registry"
        actions={
          <Link href="/dashboard/projects/new"
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400
                       text-black text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New project
          </Link>
        }
      />

      <main className="flex-1 px-6 py-6">
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="divide-y divide-zinc-800/40">
            {loading && (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-600 text-sm font-mono">Loading...</p>
              </div>
            )}
            {!loading && !projects.length && (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-600 text-sm font-mono">No projects yet</p>
              </div>
            )}
            {projects.map((project) => (
              <div key={project.id}
                className="px-5 py-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    project.status === "active" ? "bg-emerald-500" :
                    project.status === "in_progress" ? "bg-amber-500" : "bg-zinc-600"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{project.name}</p>
                    <p className="text-xs text-zinc-600 truncate">{project.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <div className="flex gap-1">
                    {project.stack_tags.slice(0, 3).map((tag: string) => (
                      <span key={tag}
                        className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-white transition-colors">
                      <GitBranch className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-white transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <Link href={`/dashboard/projects/${project.id}`}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-white transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
