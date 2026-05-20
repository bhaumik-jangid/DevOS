import { Profile } from "@/types/portfolio"
import { Code2, Trophy } from "lucide-react"

export function DSASection({ profile }: { profile: Profile | null }) {
  if (!profile?.total_dsa_solved) return null

  const difficulties = [
    { label: "Easy", count: profile.leetcode_easy, color: "text-emerald-400 bg-emerald-400/10" },
    { label: "Medium", count: profile.leetcode_medium, color: "text-amber-400 bg-amber-400/10" },
    { label: "Hard", count: profile.leetcode_hard, color: "text-red-400 bg-red-400/10" },
  ]

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
        Problem solving
      </p>
      <h2 className="text-2xl font-medium text-white mb-8">DSA & competitive programming</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* LeetCode card */}
        {profile.leetcode_username && (
          <a
            href={`https://leetcode.com/${profile.leetcode_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-zinc-800/60 rounded-xl p-5 bg-zinc-900/20
                       hover:border-zinc-700 transition-colors block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20
                                flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">LeetCode</p>
                  <p className="text-zinc-600 text-xs font-mono">
                    @{profile.leetcode_username}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-medium text-white">{profile.leetcode_solved}</p>
                <p className="text-xs text-zinc-600 font-mono">solved</p>
              </div>
            </div>

            <div className="flex gap-2">
              {difficulties.map((d) => (
                <div key={d.label}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-mono ${d.color}`}>
                  <p className="font-medium">{d.count}</p>
                  <p className="opacity-70">{d.label}</p>
                </div>
              ))}
            </div>
          </a>
        )}

        {/* Total + other platforms */}
        <div className="border border-zinc-800/60 rounded-xl p-5 bg-zinc-900/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20
                            flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-white text-sm font-medium">Total problems solved</p>
          </div>

          <p className="text-4xl font-medium text-white mb-4">{profile.total_dsa_solved}</p>

          <div className="space-y-2">
            {profile.codeforces_username && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono">Codeforces</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-mono">
                    @{profile.codeforces_username}
                  </span>
                  {profile.codeforces_rating > 0 && (
                    <span className="text-xs text-amber-400 font-mono">
                      {profile.codeforces_rating}
                    </span>
                  )}
                </div>
              </div>
            )}
            {profile.codechef_username && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono">CodeChef</span>
                <span className="text-xs text-zinc-400 font-mono">
                  @{profile.codechef_username}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
