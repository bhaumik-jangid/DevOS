import { Skill } from "@/types/portfolio"
import { AnimatedSection, AnimatedList, AnimatedItem } from "@/components/ui/animated-section"

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
    <AnimatedSection className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
        Stack
      </p>
      <h2 className="text-2xl font-medium text-white mb-8">Skills & technologies</h2>

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, categorySkills]) => (
          <div key={category}>
            <p className="text-xs text-zinc-600 font-mono uppercase tracking-wider mb-3">
              {categoryLabels[category] || category}
            </p>
            <AnimatedList className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <AnimatedItem key={skill.id}>
                  <span className="px-3 py-1.5 rounded-lg border border-zinc-800
                                   bg-zinc-900/30 text-zinc-300 text-sm font-mono
                                   hover:border-amber-500/40 hover:text-white
                                   transition-colors cursor-default">
                    {skill.name}
                  </span>
                </AnimatedItem>
              ))}
            </AnimatedList>
          </div>
        ))}
      </div>
    </AnimatedSection>
  )
}
