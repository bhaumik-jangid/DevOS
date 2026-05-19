import { Experience } from "@/types/portfolio"
import { MapPin } from "lucide-react"

export function ExperienceSection({ experience }: { experience: Experience[] }) {
  if (!experience.length) return null
  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">Experience</p>
      <h2 className="text-2xl font-medium text-white mb-8">Work history</h2>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-800" />
        <div className="space-y-8 pl-6">
          {experience.map((exp) => (
            <div key={exp.id} className="relative">
              <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-amber-500 border-2 border-[#111113]" />
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  <h3 className="text-white font-medium">{exp.role}</h3>
                  <p className="text-amber-500/80 text-sm">{exp.company}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-zinc-500 text-xs font-mono">
                    {new Date(exp.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    {" — "}
                    {exp.is_current ? "Present" : exp.end_date
                      ? new Date(exp.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                      : ""}
                  </p>
                  {exp.location && (
                    <p className="text-zinc-600 text-xs flex items-center gap-1 justify-end mt-0.5">
                      <MapPin className="w-3 h-3" />{exp.location}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">{exp.description}</p>  
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
