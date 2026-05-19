import { Skill } from "@/types/portfolio"

const categoryLabels: Record<string, string> = {
  language: "Languages",
  framework: "Frameworks",
  devops: "DevOps",
  database: "Databases",
  tool: "Tools",
}

export function SkillsSection({ skills }: { skills: Skill[] }) {
  if (!skills.length) return null
  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">Stack</p>
      <h2 className="text-2xl font-medium text-white mb-8">Skills & technologies</h2>
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, categorySkills]) => (
          <div key={category}>
            <p className="text-xs text-zinc-600 font-mono uppercase tracking-wider mb-3">
              {categoryLabels[category] || category}
            </p>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <span key={skill.id}
                  className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/30 text-zinc-300 text-sm font-mono hover:border-zinc-600 transition-colors">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
