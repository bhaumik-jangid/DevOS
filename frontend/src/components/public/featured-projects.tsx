import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Project } from "@/types/portfolio"
import { ProjectCard } from "./project-card"

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  if (!projects.length) return null
  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">Projects</p>
          <h2 className="text-2xl font-medium text-white">Featured work</h2>
        </div>
        <Link href="/projects"
          className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
          View all <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}