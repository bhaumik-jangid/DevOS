import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getProject, getProjects } from "@/lib/portfolio-api"
import { ArrowLeft, GitBranch, ArrowUpRight } from "lucide-react"

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject(params.slug)
  if (!project) return { title: "Project not found" }
  return {
    title: project.name,
    description: project.description,
  }
}

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: "bg-emerald-500", label: "Live" },
  in_progress: { color: "bg-amber-500", label: "In progress" },
  maintenance: { color: "bg-blue-500", label: "Maintenance" },
  archived: { color: "bg-zinc-500", label: "Archived" },
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProject(params.slug)
  if (!project) notFound()

  const status = statusConfig[project.status] || statusConfig.archived
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const detail = project as any

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">

      {/* Back */}
      <Link href="/projects"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white
                   text-sm transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        All projects
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${status.color}`} />
          <span className="text-xs text-zinc-500 font-mono">{status.label}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-medium text-white mb-3">
          {project.name}
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
          {project.description}
        </p>
      </div>

      {/* Links */}
      <div className="flex items-center gap-3 mb-10">
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-zinc-700
                       hover:border-zinc-500 text-zinc-300 hover:text-white
                       text-sm px-4 py-2 rounded-lg transition-colors">
            <GitBranch className="w-4 h-4" />
            Repository
          </a>
        )}
        {project.live_url && (
          <a href={project.live_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                       text-black text-sm font-medium px-4 py-2 rounded-lg
                       transition-colors">
            <ArrowUpRight className="w-4 h-4" />
            Live site
          </a>
        )}
      </div>

      {/* Stack tags */}
      <div className="mb-10">
        <p className="text-xs text-zinc-600 font-mono uppercase tracking-wider mb-3">
          Tech stack
        </p>
        <div className="flex flex-wrap gap-2">
          {project.stack_tags?.map((tag: string) => (
            <span key={tag}
              className="px-3 py-1.5 rounded-lg border border-zinc-800
                         bg-zinc-900/30 text-zinc-300 text-sm font-mono">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Long description */}
      {detail.long_description && (
        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-xs text-zinc-600 font-mono uppercase tracking-wider mb-3">
            About
          </p>
          <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
            {detail.long_description}
          </p>
        </div>
      )}

      {/* Deployment info */}
      {(detail.hosting_provider || detail.health_endpoint) && (
        <div className="mt-10 pt-8 border-t border-zinc-800/60">
          <p className="text-xs text-zinc-600 font-mono uppercase tracking-wider mb-4">
            Infrastructure
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {detail.hosting_provider && (
              <div className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20">
                <p className="text-xs text-zinc-600 font-mono mb-1">Hosting</p>
                <p className="text-zinc-300 text-sm capitalize">
                  {detail.hosting_provider}
                </p>
              </div>
            )}
            {detail.health_endpoint && (
              <div className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20">
                <p className="text-xs text-zinc-600 font-mono mb-1">Health endpoint</p>
                <p className="text-zinc-300 text-sm font-mono truncate">
                  {detail.health_endpoint}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
