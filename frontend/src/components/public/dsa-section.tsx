import { Profile } from "@/types/portfolio"
import { Code2, Trophy, TrendingUp } from "lucide-react"
import { getLeetCodeStats } from "@/lib/leetcode"
import { AnimatedSection } from "@/components/ui/animated-section"

export async function DSASection({ profile }: { profile: Profile | null }) {
  if (!profile?.total_dsa_solved && !profile?.leetcode_username) return null

  // Fetch live LeetCode stats if username is set
  const liveStats = profile?.leetcode_username
    ? await getLeetCodeStats(profile.leetcode_username)
    : null

  const solved = liveStats?.totalSolved ?? profile?.leetcode_solved ?? 0
  const easy = liveStats?.easySolved ?? profile?.leetcode_easy ?? 0
  const medium = liveStats?.mediumSolved ?? profile?.leetcode_medium ?? 0
  const hard = liveStats?.hardSolved ?? profile?.leetcode_hard ?? 0

  return (
    <AnimatedSection className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
        Problem solving
      </p>
      <h2 className="text-2xl font-medium text-white mb-8">
        DSA & competitive programming
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* LeetCode card */}
        {profile.leetcode_username && (
          <a
            href={`https://leetcode.com/${profile.leetcode_username}`}
            target="_blank" rel="noopener noreferrer"
            className="group border border-zinc-800/60 rounded-xl p-5
                       bg-zinc-900/20 hover:border-amber-500/30
                       hover:bg-zinc-900/40 transition-all duration-200">

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
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
                <p className="text-3xl font-bold text-white">{solved}</p>
                <p className="text-xs text-zinc-500 font-mono">solved</p>
              </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Easy", count: easy, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
                { label: "Medium", count: medium, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
                { label: "Hard", count: hard, color: "text-red-400 bg-red-400/10 border-red-400/20" },
              ].map((d) => (
                <div key={d.label}
                  className={`text-center py-2 px-1 rounded-lg border text-xs font-mono ${d.color}`}>
                  <p className="font-bold text-base">{d.count}</p>
                  <p className="opacity-70">{d.label}</p>
                </div>
              ))}
            </div>

            {liveStats && (
              <p className="text-xs text-zinc-700 font-mono mt-3 text-right">
                Live data
              </p>
            )}
          </a>
        )}

        {/* Total stats */}
        <div className="border border-zinc-800/60 rounded-xl p-5 bg-zinc-900/20">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20
                            flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-white text-sm font-medium">All platforms</p>
          </div>

          <p className="text-4xl font-bold text-white mb-4">
            {profile.total_dsa_solved}
            <span className="text-base font-normal text-zinc-500 ml-2">problems</span>
          </p>

          <div className="space-y-2.5">
            {profile.codeforces_username && (
              <div className="flex items-center justify-between py-2
                              border-b border-zinc-800/40">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs text-zinc-500">Codeforces</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-mono">
                    @{profile.codeforces_username}
                  </span>
                  {profile.codeforces_rating > 0 && (
                    <span className="text-xs text-amber-400 font-mono font-bold">
                      {profile.codeforces_rating}
                    </span>
                  )}
                </div>
              </div>
            )}
            {profile.codechef_username && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs text-zinc-500">CodeChef</span>
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  @{profile.codechef_username}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}
