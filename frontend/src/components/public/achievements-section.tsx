import { Achievement } from "@/types/portfolio"
import { Award } from "lucide-react"

export function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
  if (!achievements.length) return null

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
        Recognition
      </p>
      <h2 className="text-2xl font-medium text-white mb-8">Achievements</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.map((item) => (
          <div key={item.id}
            className="border border-zinc-800/60 rounded-xl p-5 bg-zinc-900/20
                       hover:border-zinc-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20
                              flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="min-w-0">
                <h3 className="text-white text-sm font-medium mb-1">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.description}</p>
                {item.date && (
                  <p className="text-zinc-600 text-xs font-mono mt-2">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "long", year: "numeric"
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
