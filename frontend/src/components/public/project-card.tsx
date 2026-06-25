import Link from "next/link"
import { ArrowUpRight, GitBranch } from "lucide-react"
import { Project } from "@/types/portfolio"

const statusColors: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10",
  maintenance: "text-amber-400 bg-amber-400/10",
  archived: "text-zinc-400 bg-zinc-400/10",
  in_progress: "text-blue-400 bg-blue-400/10",
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={project.slug ? `/projects/${project.slug}/` : "#"}>
      <article className="group border border-zinc-800/60 rounded-xl p-5
                          bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40
                          transition-all duration-200 h-full">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono
                            ${statusColors[project.status] || statusColors.active}`}>
            {project.status.replace("_", " ")}
          </span>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {project.github_url && <GitBranch className="w-4 h-4 text-zinc-500" />}
            {project.live_url && <ArrowUpRight className="w-4 h-4 text-zinc-500" />}
          </div>
        </div>
        <h3 className="text-white font-medium mb-2">{project.name}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.stack_tags.slice(0, 5).map((tag: string) => (
            <span key={tag}
              className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              {tag}
            </span>
          ))}
        </div>
      </article>
    </Link>
  )
}