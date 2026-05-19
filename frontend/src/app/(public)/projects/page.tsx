import { getProjects } from "@/lib/portfolio-api"
import { ProjectCard } from "@/components/public/project-card"

export default async function ProjectsPage() {
  const projects = await getProjects()
  console.log("Projects:", projects);

  return (
    <div className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
      <div className="mb-10">
        <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">Work</p>
        <h1 className="text-3xl font-medium text-white">All projects</h1>
      </div>

      {!projects.length ? (
        <div className="text-center py-20 border border-zinc-800/50 rounded-xl">
          <p className="text-zinc-600 font-mono text-sm">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}