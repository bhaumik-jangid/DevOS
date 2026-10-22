"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Eye, EyeOff, GitBranch, Star, GitFork,
  Loader2, RefreshCw, CheckSquare, Square
} from "lucide-react"
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
  fork: boolean
  updated_at: string
}

export default function GitHubReposPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [hiddenRepos, setHiddenRepos] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const fetchAll = async () => {
    try {
      const profileRes = await api.get("/portfolio/profile/")
      const hidden: string[] = profileRes.data.hidden_github_repos || []
      setHiddenRepos(new Set(hidden))

      const username =
        process.env.NEXT_PUBLIC_GITHUB_USERNAME || ""
      if (!username) {
        toast.error("NEXT_PUBLIC_GITHUB_USERNAME not set")
        return
      }

      const ghRes = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=30&type=public`,
        { headers: { Accept: "application/vnd.github+json" } }
      )
      if (ghRes.ok) {
        const data: GitHubRepo[] = await ghRes.json()
        setRepos(data.filter((r) => !r.fork))
      }
    } catch {
      toast.error("Failed to load")
    } finally {
      setLoading(false)
      setHasChanges(false)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    void fetchAll()
  }

  useEffect(() => {
    const load = async () => {
      await fetchAll()
    }

    void load()
  }, [])

  const toggleRepo = (name: string) => {
    setHiddenRepos((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
    setHasChanges(true)
  }

  const enableAll = () => {
    setHiddenRepos(new Set())
    setHasChanges(true)
  }

  const disableAll = () => {
    setHiddenRepos(new Set(repos.map((r) => r.name)))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch("/portfolio/profile/update/", {
        hidden_github_repos: Array.from(hiddenRepos),
      })
      // Trigger revalidation
      await fetch("/api/revalidate?path=/", { method: "POST" }).catch(() => { })
      toast.success("Saved — portfolio updated")
      setHasChanges(false)
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const visibleCount = repos.filter((r) => !hiddenRepos.has(r.name)).length
  const allVisible = hiddenRepos.size === 0
  const allHidden = hiddenRepos.size === repos.length

  return (
    <>
      <Topbar
        title="GitHub Repos"
        description={`${visibleCount} of ${repos.length} visible on portfolio`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={loading}
              className="p-1.5 border border-zinc-800 rounded-lg text-zinc-500
                         hover:text-white hover:border-zinc-600 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={hasChanges ? handleSave : undefined}
              disabled={saving || !hasChanges}
              className={`flex items-center gap-1.5 text-xs font-medium
                           px-3 py-1.5 rounded-lg transition-colors ${hasChanges
                  ? "bg-amber-500 hover:bg-amber-400 text-black"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }`}>
              {saving
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving</>
                : hasChanges ? "Save changes" : "No changes"
              }
            </button>
          </div>
        }
      />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 overflow-auto space-y-3">

        {/* Bulk actions */}
        {!loading && repos.length > 0 && (
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/60">
            <p className="text-xs text-zinc-500 font-mono flex-1">
              {visibleCount} shown · {hiddenRepos.size} hidden
            </p>
            <button
              onClick={enableAll}
              disabled={allVisible}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                         border border-zinc-800 text-zinc-400 hover:text-emerald-400
                         hover:border-emerald-500/30 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed">
              <CheckSquare className="w-3.5 h-3.5" />
              Show all
            </button>
            <button
              onClick={disableAll}
              disabled={allHidden}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                         border border-zinc-800 text-zinc-400 hover:text-red-400
                         hover:border-red-500/30 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed">
              <Square className="w-3.5 h-3.5" />
              Hide all
            </button>
          </div>
        )}

        {/* Repo list */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-600 text-sm font-mono">Loading repos...</p>
          </div>
        )}

        {!loading && !repos.length && (
          <div className="text-center py-12 border border-zinc-800/60 rounded-xl">
            <GitBranch className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-600 text-sm font-mono">No repos found</p>
            <p className="text-zinc-700 text-xs mt-1">
              Set NEXT_PUBLIC_GITHUB_USERNAME in environment variables
            </p>
          </div>
        )}

        {!loading && repos.map((repo) => {
          const isHidden = hiddenRepos.has(repo.name)
          return (
            <div key={repo.id}
              className={`border rounded-xl px-4 py-3.5 flex items-center gap-3
                           transition-all duration-150 ${isHidden
                  ? "border-zinc-800/30 opacity-50"
                  : "border-zinc-800/60 bg-zinc-900/10"
                }`}>

              {/* Status indicator */}
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isHidden ? "bg-zinc-700" : "bg-emerald-500"
                }`} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-white font-medium hover:text-amber-400
                               transition-colors">
                    {repo.name}
                  </a>
                  {repo.language && (
                    <span className="text-xs text-zinc-600 font-mono">
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazers_count > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-zinc-600 font-mono">
                      <Star className="w-3 h-3" />{repo.stargazers_count}
                    </span>
                  )}
                  {repo.forks_count > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-zinc-600 font-mono">
                      <GitFork className="w-3 h-3" />{repo.forks_count}
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">
                    {repo.description}
                  </p>
                )}
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleRepo(repo.name)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                             border transition-all duration-150 shrink-0 ${isHidden
                    ? "border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500"
                    : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                  }`}>
                {isHidden
                  ? <><EyeOff className="w-3.5 h-3.5" />Hidden</>
                  : <><Eye className="w-3.5 h-3.5" />Visible</>
                }
              </button>
            </div>
          )
        })}

        {/* Unsaved changes reminder */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                           flex items-center gap-3 px-4 py-3 rounded-xl
                           bg-zinc-900 border border-amber-500/30
                           shadow-xl shadow-black/40">
            <p className="text-sm text-zinc-300">Unsaved changes</p>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400
                         text-black text-xs font-medium px-3 py-1.5 rounded-lg
                         transition-colors">
              {saving
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving</>
                : "Save now"
              }
            </button>
          </div>
        )}
      </main>
    </>
  )
}
