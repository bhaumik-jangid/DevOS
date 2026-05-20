import { Academic } from "@/types/portfolio"
import { GraduationCap } from "lucide-react"

const levelLabels: Record<string, string> = {
  "10th": "10th Standard",
  "12th": "12th Standard",
  "diploma": "Diploma",
  "btech": "B.Tech",
  "mtech": "M.Tech",
  "other": "Education",
}

export function AcademicSection({ academics }: { academics: Academic[] }) {
  if (!academics.length) return null

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
        Education
      </p>
      <h2 className="text-2xl font-medium text-white mb-8">Academic background</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {academics.map((item) => (
          <div key={item.id}
            className="border border-zinc-800/60 rounded-xl p-5 bg-zinc-900/20
                       hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20
                              flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-xs font-mono text-zinc-600">
                {item.start_year} — {item.is_current ? "Present" : item.end_year}
              </span>
            </div>

            <p className="text-xs text-amber-500/80 font-mono uppercase tracking-wider mb-1">
              {levelLabels[item.level] || item.level}
            </p>
            <h3 className="text-white text-sm font-medium mb-1 leading-snug">
              {item.institution}
            </h3>
            {item.board_or_university && (
              <p className="text-zinc-600 text-xs mb-2">{item.board_or_university}</p>
            )}
            {item.field_of_study && (
              <p className="text-zinc-500 text-xs mb-3">{item.field_of_study}</p>
            )}

            <div className="flex items-baseline gap-1.5 pt-3 border-t border-zinc-800/60">
              <span className="text-xl font-medium text-white">
                {item.percentage_or_cgpa}
              </span>
              <span className="text-xs text-zinc-600 font-mono">{item.scale}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
