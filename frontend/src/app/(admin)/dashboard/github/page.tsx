"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff, GitBranch, Star, Loader2, RefreshCw } from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  topics: string[]
  updated_at: string
}

interface ProfileData {
  hidden_github_repos: string[]
}

export default function GitHubReposPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [hiddenRepos, setHiddenRepos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [profileRes] = await Promise.all([
        api.get("/portfolio/profile/"),
      ])
      const profileData = profileRes.data as ProfileData
      setHiddenRepos(profileData.hidden_github_repos || [])

      // Fetch GitHub repos via our own API or directly
      const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || ""
      if (username) {
        const ghRes = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=30&type=public`
        )
        if (ghRes.ok) {
          const data = await ghRes.json()
          setRepos(data.filter((r: GitHubRepo & { fork: boolean }) => !r.fork))
        }
      }
    } catch {
      toast.error("Failed to load repos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const toggleRepo = (repoName: string) => {
    setHiddenRepos((prev) =>
      prev.includes(repoName)
        ? prev.filter((r) => r !== repoName)
        : [...prev, repoName]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch("/portfolio/profile/update/", {
        hidden_github_repos: hiddenRepos,
      })
      toast.success("GitHub visibility saved")
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const visibleCount = repos.length - hiddenRepos.filter(h =>
    repos.some(r => r.name === h)
  ).length

  return (
    <>
      <Topbar
        title="GitHub Repos"
        description={`${visibleCount} of ${repos.length} shown on portfolio`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={fetchAll}
              className="p-1.5 border border-zinc-800 rounded-lg text-zinc-500
                         hover:text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400
                         disabled:bg-amber-500/40 text-black text-xs font-medium
                         px-3 py-1.5 rounded-lg transition-colors">
              {saving
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving</>
                : "Save visibility"
              }
            </button>
          </div>
        }
      />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 overflow-auto">
        {loading ? (
          <p className="text-zinc-600 font-mono text-sm">Loading repos...</p>
        ) : !repos.length ? (
          <div className="text-center py-12 border border-zinc-800/60 rounded-xl">
            <GitBranch className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-600 text-sm font-mono">
              No repos found. Set NEXT_PUBLIC_GITHUB_USERNAME in Vercel env vars.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 mb-4">
              Toggle repos to show or hide them on your public portfolio.
              Disabled repos are hidden from visitors.
            </p>
            {repos.map((repo) => {
              const isHidden = hiddenRepos.includes(repo.name)
              return (
                <div key={repo.id}
                  className={`border rounded-xl px-4 py-3 flex items-center gap-3
                               transition-colors ${isHidden
                      ? "border-zinc-800/40 bg-zinc-900/10 opacity-60"
                      : "border-zinc-800/60 bg-zinc-900/20"
                    }`}>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <p className="text-sm text-white font-medium truncate">
                        {repo.name}
                      </p>
                      {repo.language && (
                        <span className="text-xs text-zinc-600 font-mono shrink-0">
                          {repo.language}
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-xs text-zinc-500 mt-0.5 truncate ml-5">
                        {repo.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {repo.stargazers_count > 0 && (
                      <div className="flex items-center gap-1 text-zinc-600">
                        <Star className="w-3 h-3" />
                        <span className="text-xs font-mono">{repo.stargazers_count}</span>
                      </div>
                    )}
                    <button
                      onClick={() => toggleRepo(repo.name)}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5
                                   rounded-lg border transition-colors ${isHidden
                          ? "border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500"
                          : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                        }`}>
                      {isHidden
                        ? <><EyeOff className="w-3 h-3" />Hidden</>
                        : <><Eye className="w-3 h-3" />Visible</>
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
