import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Project } from "@/types/portfolio"
import { ProjectCard } from "./project-card"
import { AnimatedSection, AnimatedList, AnimatedItem } from "@/components/ui/animated-section"

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  if (!projects.length) return null
  return (
    <AnimatedSection className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
            Projects
          </p>
          <h2 className="text-2xl font-medium text-white">Featured work</h2>
        </div>
        <Link href="/projects"
          className="text-sm text-zinc-500 hover:text-white transition-colors
                     flex items-center gap-1">
          View all <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((project) => (
          <AnimatedItem key={project.id}>
            <ProjectCard project={project} />
          </AnimatedItem>
        ))}
      </AnimatedList>
    </AnimatedSection>
  )
}
