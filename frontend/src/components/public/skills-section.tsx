"use client"

import { motion } from "framer-motion"
import { Skill } from "@/types/portfolio"
import { AnimatedSection } from "@/components/ui/animated-section"

const categoryLabels: Record<string, string> = {
  language: "Languages",
  framework: "Frameworks",
  devops: "DevOps",
  database: "Databases",
  tool: "Tools",
}

// Map skill names to devicon class names
const deviconMap: Record<string, string> = {
  Python: "devicon-python-plain",
  TypeScript: "devicon-typescript-plain",
  JavaScript: "devicon-javascript-plain",
  Django: "devicon-django-plain",
  "Next.js": "devicon-nextjs-plain",
  React: "devicon-react-original",
  Docker: "devicon-docker-plain",
  PostgreSQL: "devicon-postgresql-plain",
  Redis: "devicon-redis-plain",
  Nginx: "devicon-nginx-plain",
  Git: "devicon-git-plain",
  GitHub: "devicon-github-original",
  Linux: "devicon-linux-plain",
  "Node.js": "devicon-nodejs-plain",
  Tailwind: "devicon-tailwindcss-plain",
  CSS: "devicon-css3-plain",
  HTML: "devicon-html5-plain",
  AWS: "devicon-amazonwebservices-plain",
  Celery: "devicon-celery-plain",
  Jenkins: "devicon-jenkins-plain",
  VSCode: "devicon-vscode-plain",
}

export function SkillsSection({ skills }: { skills: Skill[] }) {
  if (!skills.length) return null

  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <>
      {/* Load devicons CSS */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
      />

      <AnimatedSection className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
          Stack
        </p>
        <h2 className="text-2xl font-medium text-white mb-10">
          Skills & technologies
        </h2>

        <div className="space-y-8">
          {Object.entries(grouped).map(([category, categorySkills]) => (
            <div key={category}>
              <p className="text-xs text-zinc-600 font-mono uppercase tracking-wider mb-4">
                {categoryLabels[category] || category}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {categorySkills.map((skill, i) => {
                  const iconClass = skill.icon_name || deviconMap[skill.name]
                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      whileHover={{ y: -4, scale: 1.05 }}
                      className="group flex flex-col items-center gap-2 p-3
                                 rounded-xl border border-zinc-800/60
                                 bg-zinc-900/20 hover:border-amber-500/30
                                 hover:bg-zinc-900/60 transition-all duration-200
                                 cursor-default">
                      {iconClass ? (
                        <i className={`${iconClass} text-2xl colored`} />
                      ) : (
                        <div className="w-6 h-6 rounded bg-zinc-700 flex items-center
                                        justify-center text-xs text-zinc-400 font-mono">
                          {skill.name.slice(0, 2)}
                        </div>
                      )}
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-300
                                       transition-colors text-center leading-tight font-mono">
                        {skill.name}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>
    </>
  )
}
