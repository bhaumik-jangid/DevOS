"use client"

import Link from "next/link"
import { ArrowUpRight, GitBranch } from "lucide-react"
import { Project } from "@/types/portfolio"

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: "bg-emerald-500", label: "Live" },
  in_progress: { color: "bg-amber-500", label: "In progress" },
  maintenance: { color: "bg-blue-500", label: "Maintenance" },
  archived: { color: "bg-zinc-600", label: "Archived" },
}

export function ProjectCard({ project }: { project: Project }) {
  const status = statusConfig[project.status] || statusConfig.archived
  const hasLinks = project.live_url || project.github_url

  return (
    <article className="group relative h-full border border-zinc-800/60 rounded-xl
                         bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40
                         transition-all duration-200 overflow-hidden flex flex-col">

      {/* Card body — links to detail page */}
      <Link
        href={project.slug ? `/projects/${project.slug}` : "#"}
        className="flex flex-col flex-1 p-5">

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
            <span className="text-xs text-zinc-500 font-mono">{status.label}</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400
                                    transition-colors" />
        </div>

        <h3 className="text-white font-medium mb-2 group-hover:text-amber-400
                       transition-colors">
          {project.name}
        </h3>

        <p className="text-zinc-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.stack_tags.slice(0, 4).map((tag: string) => (
            <span key={tag}
              className="text-xs px-2 py-0.5 rounded-md bg-zinc-800/60
                         border border-zinc-700/50 text-zinc-400 font-mono">
              {tag}
            </span>
          ))}
          {project.stack_tags.length > 4 && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800/40
                             text-zinc-600 font-mono">
              +{project.stack_tags.length - 4}
            </span>
          )}
        </div>
      </Link>

      {/* Action buttons — only shown if links exist */}
      {hasLinks && (
        <div className="flex items-center gap-2 px-5 py-3 border-t border-zinc-800/40">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Live
            </a>
          )}

          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
              Source
            </a>
          )}
        </div>
      )}
    </article>
  )
}
