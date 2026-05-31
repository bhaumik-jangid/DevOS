"use client"

import { useEffect, useState } from "react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

export default function AdminPortfolioPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [skills, setSkills] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [experience, setExperience] = useState<any[]>([])

  useEffect(() => {
    api.get("/portfolio/skills/").then((r) => setSkills(r.data.results || r.data))
    api.get("/portfolio/experience/").then((r) => setExperience(r.data.results || r.data))
  }, [])

  return (
    <>
      <Topbar title="Portfolio" description="Manage skills and experience" />
      <main className="flex-1 px-6 py-6 space-y-6">

        {/* Skills */}
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800/60">
            <p className="text-sm font-medium text-white">Skills</p>
          </div>
          <div className="divide-y divide-zinc-800/40">
            {skills.map((skill) => (
              <div key={skill.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{skill.name}</p>
                  <p className="text-xs text-zinc-600 font-mono">{skill.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${skill.proficiency}%` }} />
                  </div>
                  <span className="text-xs text-zinc-600 font-mono w-8 text-right">
                    {skill.proficiency}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800/60">
            <p className="text-sm font-medium text-white">Experience</p>
          </div>
          <div className="divide-y divide-zinc-800/40">
            {experience.map((exp) => (
              <div key={exp.id} className="px-5 py-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{exp.role}</p>
                    <p className="text-xs text-amber-500/80">{exp.company}</p>
                  </div>
                  <p className="text-xs text-zinc-600 font-mono">
                    {exp.is_current ? "Current" : exp.end_date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  )
}
