"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Plus, Tv, Film, Star, Loader2, Trash2,
  Pencil, Bot, BarChart2, Search, TrendingUp
} from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

interface WatchItem {
  id: number
  title: string
  media_type: string
  platform: string
  status: string
  watched_seasons: number
  total_seasons: number | null
  watched_episodes: number
  total_episodes: number | null
  personal_rating: number | null
  genres: string[]
  poster_url: string
  release_year: number | null
  progress_percent: number | null
  added_at: string
  notify_new_season: boolean
}

interface WatchStats {
  total: number
  completed: number
  watching: number
  dropped: number
  plan_to_watch: number
  average_rating: number | null
  by_platform: { platform: string; count: number }[]
  by_genre: { genre: string; count: number }[]
  top_rated: { id: number; title: string; personal_rating: number; media_type: string }[]
}

type ActiveView = "list" | "stats" | "ai"

const PLATFORM_LABELS: Record<string, string> = {
  netflix: "Netflix", prime: "Prime Video", hotstar: "Hotstar",
  jiocinema: "JioCinema", youtube: "YouTube", other: "Other"
}

const STATUS_COLORS: Record<string, string> = {
  watching: "text-amber-400 bg-amber-400/10",
  completed: "text-emerald-400 bg-emerald-400/10",
  dropped: "text-red-400 bg-red-400/10",
  plan_to_watch: "text-blue-400 bg-blue-400/10",
  on_hold: "text-zinc-400 bg-zinc-400/10",
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchItem[]>([])
  const [stats, setStats] = useState<WatchStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<ActiveView>("list")
  const [aiResponse, setAiResponse] = useState<string>("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiType, setAiType] = useState<"recommend" | "pattern" | "summary">("recommend")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [autofilling, setAutofilling] = useState(false)
  const [newItem, setNewItem] = useState({
    title: "", media_type: "series", platform: "netflix",
    status: "watching", personal_rating: "", total_seasons: "",
    watched_seasons: "", genres: "", notify_new_season: true,
    release_year: "", poster_url: ""
  })

  const fetchAll = () => {
    Promise.all([
      api.get("/watchlist/").then((r) => setItems(r.data.results || r.data)),
      api.get("/watchlist/stats/").then((r) => setStats(r.data)),
    ]).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleAI = async () => {
    setAiLoading(true)
    setAiResponse("")
    try {
      const res = await api.post("/watchlist/ai/", { type: aiType })
      setAiResponse(res.data.response)
    } catch {
      toast.error("AI query failed")
    } finally {
      setAiLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        title: newItem.title,
        media_type: newItem.media_type,
        platform: newItem.platform,
        status: newItem.status,
        notify_new_season: newItem.notify_new_season,
        genres: newItem.genres ? newItem.genres.split(",").map((g) => g.trim()) : [],
        personal_rating: newItem.personal_rating ? parseFloat(newItem.personal_rating) : null,
        total_seasons: newItem.total_seasons ? parseInt(newItem.total_seasons) : null,
        watched_seasons: newItem.watched_seasons ? parseInt(newItem.watched_seasons) : 0,
        release_year: newItem.release_year ? parseInt(newItem.release_year) : null,
        poster_url: newItem.poster_url || "",
      }
      await api.post("/watchlist/", payload)
      toast.success("Added to watchlist")
      setShowAddForm(false)
      fetchAll()
    } catch {
      toast.error("Failed to add item")
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Remove "${title}"?`)) return
    try {
      await api.delete(`/watchlist/${id}/`)
      toast.success("Removed")
      fetchAll()
    } catch {
      toast.error("Failed to remove")
    }
  }

  const handleAutofill = async () => {
    if (!newItem.title.trim()) {
      toast.error("Enter a title first")
      return
    }
    setAutofilling(true)
    try {
      const res = await api.post("/watchlist/autofill/", { title: newItem.title })
      const d = res.data.data
      setNewItem((p) => ({
        ...p,
        media_type: d.media_type || p.media_type,
        platform: d.platform || p.platform,
        genres: Array.isArray(d.genres) ? d.genres.join(", ") : p.genres,
        total_seasons: d.total_seasons ? String(d.total_seasons) : p.total_seasons,
        release_year: d.release_year ? String(d.release_year) : p.release_year,
        personal_rating: d.suggested_rating ? String(d.suggested_rating) : p.personal_rating,
      }))
      toast.success("Details fetched — review and adjust if needed")
    } catch {
      toast.error("Failed to fetch details")
    } finally {
      setAutofilling(false)
    }
  }

  const filtered = items.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter ? item.status === statusFilter : true
    return matchSearch && matchStatus
  })

  const inputCls = `w-full bg-[#1a1a1c] border border-zinc-800 rounded-lg px-3 py-2
                    text-white text-sm placeholder-zinc-600
                    focus:outline-none focus:border-amber-500/60 transition-colors`
  const selectCls = `${inputCls} cursor-pointer`

  return (
    <>
      <Topbar
        title="Watchlist"
        description={`${items.length} titles tracked`}
        actions={
          <div className="flex items-center gap-2">
            {(["list", "stats", "ai"] as ActiveView[]).map((view) => (
              <button key={view} onClick={() => setActiveView(view)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors capitalize ${
                  activeView === view
                    ? "bg-amber-500 text-black font-medium"
                    : "border border-zinc-800 text-zinc-500 hover:text-white"
                }`}>
                {view === "ai" ? "AI" : view}
              </button>
            ))}
            <button onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700
                         text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        }
      />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 overflow-auto space-y-4">

        {/* Add form */}
        {showAddForm && (
          <form onSubmit={handleAdd}
            className="border border-zinc-800/60 rounded-xl p-5 bg-zinc-900/20 space-y-4">
            <h3 className="text-sm font-medium text-white">Add to watchlist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-zinc-500 font-mono uppercase
                                   tracking-wider mb-1">Title</label>
                <input value={newItem.title} required
                  onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Breaking Bad" className={inputCls} />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={handleAutofill} disabled={autofilling}
                  className="flex items-center gap-1.5 border border-zinc-700
                             hover:border-amber-500/40 text-zinc-400 hover:text-amber-400
                             text-xs px-3 py-2 rounded-lg transition-colors
                             disabled:opacity-50 whitespace-nowrap h-[38px]">
                  {autofilling
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Fetching...</>
                    : <><Bot className="w-3.5 h-3.5" />AI autofill</>
                  }
                </button>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-mono uppercase
                                   tracking-wider mb-1">Type</label>
                <select value={newItem.media_type}
                  onChange={(e) => setNewItem((p) => ({ ...p, media_type: e.target.value }))}
                  className={selectCls}>
                  <option value="series">Series</option>
                  <option value="movie">Movie</option>
                  <option value="anime">Anime</option>
                  <option value="documentary">Documentary</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-mono uppercase
                                   tracking-wider mb-1">Platform</label>
                <select value={newItem.platform}
                  onChange={(e) => setNewItem((p) => ({ ...p, platform: e.target.value }))}
                  className={selectCls}>
                  {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-mono uppercase
                                   tracking-wider mb-1">Status</label>
                <select value={newItem.status}
                  onChange={(e) => setNewItem((p) => ({ ...p, status: e.target.value }))}
                  className={selectCls}>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                  <option value="plan_to_watch">Plan to watch</option>
                  <option value="dropped">Dropped</option>
                  <option value="on_hold">On hold</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-mono uppercase
                                   tracking-wider mb-1">Rating / 10</label>
                <input type="number" min="0" max="10" step="0.1"
                  value={newItem.personal_rating}
                  onChange={(e) => setNewItem((p) => ({ ...p, personal_rating: e.target.value }))}
                  placeholder="8.5" className={inputCls} />
              </div>
              {newItem.media_type !== "movie" && (
                <>
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono uppercase
                                       tracking-wider mb-1">Total seasons</label>
                    <input type="number" min="0"
                      value={newItem.total_seasons}
                      onChange={(e) => setNewItem((p) => ({ ...p, total_seasons: e.target.value }))}
                      placeholder="5" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono uppercase
                                       tracking-wider mb-1">Watched seasons</label>
                    <input type="number" min="0"
                      value={newItem.watched_seasons}
                      onChange={(e) => setNewItem((p) => ({ ...p, watched_seasons: e.target.value }))}
                      placeholder="3" className={inputCls} />
                  </div>
                </>
              )}
              <div className="sm:col-span-2">
                <label className="block text-xs text-zinc-500 font-mono uppercase
                                   tracking-wider mb-1">Genres (comma separated)</label>
                <input value={newItem.genres}
                  onChange={(e) => setNewItem((p) => ({ ...p, genres: e.target.value }))}
                  placeholder="Crime, Drama, Thriller" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-mono uppercase
                                   tracking-wider mb-1">Release year</label>
                <input type="number" value={newItem.release_year}
                  onChange={(e) => setNewItem((p) => ({ ...p, release_year: e.target.value }))}
                  placeholder="2023" className={inputCls} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newItem.notify_new_season}
                onChange={(e) => setNewItem((p) => ({ ...p, notify_new_season: e.target.checked }))}
                className="w-4 h-4 accent-amber-500" />
              <span className="text-sm text-zinc-400">
                Notify when new season releases
              </span>
            </label>
            <div className="flex gap-3">
              <button type="submit"
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                           text-black text-sm font-medium px-4 py-2 rounded-lg">
                <Plus className="w-4 h-4" />Add
              </button>
              <button type="button" onClick={() => setShowAddForm(false)}
                className="text-sm text-zinc-500 hover:text-white px-4 py-2 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* List view */}
        {activeView === "list" && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5
                                    text-zinc-600" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search titles..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg
                             pl-9 pr-3 py-2 text-white text-sm placeholder-zinc-600
                             focus:outline-none focus:border-zinc-600 transition-colors" />
              </div>
              <select value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2
                           text-sm text-zinc-400 focus:outline-none cursor-pointer">
                <option value="">All status</option>
                <option value="watching">Watching</option>
                <option value="completed">Completed</option>
                <option value="plan_to_watch">Plan to watch</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {loading && (
                <div className="text-center py-8">
                  <p className="text-zinc-600 font-mono text-sm">Loading...</p>
                </div>
              )}
              {!loading && !filtered.length && (
                <div className="text-center py-12 border border-zinc-800/60 rounded-xl">
                  <Tv className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-600 text-sm font-mono">Nothing here yet</p>
                </div>
              )}
              {filtered.map((item) => (
                <div key={item.id}
                  className="border border-zinc-800/60 rounded-xl px-4 py-3
                             hover:bg-zinc-800/10 transition-colors
                             grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4 flex items-center gap-2">
                    {item.media_type === "movie"
                      ? <Film className="w-4 h-4 text-zinc-600 shrink-0" />
                      : <Tv className="w-4 h-4 text-zinc-600 shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.title}</p>
                      <p className="text-zinc-600 text-xs font-mono">
                        {PLATFORM_LABELS[item.platform]} · {item.release_year || ""}
                      </p>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-mono
                      ${STATUS_COLORS[item.status] || "text-zinc-400 bg-zinc-400/10"}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    {item.total_seasons ? (
                      <p className="text-xs text-zinc-500 font-mono">
                        S{item.watched_seasons}/{item.total_seasons} seasons
                      </p>
                    ) : item.total_episodes ? (
                      <p className="text-xs text-zinc-500 font-mono">
                        Ep {item.watched_episodes}/{item.total_episodes}
                      </p>
                    ) : null}
                    {item.progress_percent !== null && (
                      <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden w-20">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${item.progress_percent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    {item.personal_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm text-white font-mono">
                          {item.personal_rating}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-1 justify-end">
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600
                                 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Stats view */}
        {activeView === "stats" && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total", value: stats.total, color: "text-white" },
                { label: "Watching", value: stats.watching, color: "text-amber-400" },
                { label: "Completed", value: stats.completed, color: "text-emerald-400" },
                { label: "Dropped", value: stats.dropped, color: "text-red-400" },
              ].map((stat) => (
                <div key={stat.label}
                  className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20">
                  <p className="text-xs text-zinc-600 font-mono uppercase mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-medium ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {stats.average_rating && (
              <div className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20">
                <p className="text-xs text-zinc-600 font-mono uppercase mb-1">
                  Average rating
                </p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  <span className="text-2xl font-medium text-white">
                    {stats.average_rating} / 10
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20">
                <p className="text-xs text-zinc-600 font-mono uppercase mb-3">By platform</p>
                <div className="space-y-2">
                  {stats.by_platform.map((p) => (
                    <div key={p.platform} className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">
                        {PLATFORM_LABELS[p.platform] || p.platform}
                      </span>
                      <span className="text-sm font-mono text-white">{p.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20">
                <p className="text-xs text-zinc-600 font-mono uppercase mb-3">Top genres</p>
                <div className="space-y-2">
                  {stats.by_genre.slice(0, 6).map((g) => (
                    <div key={g.genre} className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">{g.genre}</span>
                      <span className="text-sm font-mono text-white">{g.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {stats.top_rated.length > 0 && (
              <div className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20">
                <p className="text-xs text-zinc-600 font-mono uppercase mb-3">Top rated</p>
                <div className="space-y-2">
                  {stats.top_rated.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">{item.title}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm font-mono text-white">
                          {item.personal_rating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI view */}
        {activeView === "ai" && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              {(["recommend", "pattern", "summary"] as const).map((type) => (
                <button key={type} onClick={() => setAiType(type)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors capitalize ${
                    aiType === type
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                      : "border border-zinc-800 text-zinc-500 hover:text-white"
                  }`}>
                  {type === "recommend" ? "Recommendations"
                    : type === "pattern" ? "Pattern analysis"
                    : "Summary"}
                </button>
              ))}
            </div>

            <div className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20">
              <p className="text-xs text-zinc-500 mb-3">
                {aiType === "recommend"
                  ? "Get personalized recommendations based on your ratings and genres."
                  : aiType === "pattern"
                  ? "Analyze your watching patterns and preferences."
                  : "Get a summary of your streaming life."}
              </p>
              <button onClick={handleAI} disabled={aiLoading}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                           disabled:bg-amber-500/40 text-black text-sm font-medium
                           px-4 py-2 rounded-lg transition-colors">
                {aiLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</>
                  : <><Bot className="w-4 h-4" />Ask Gemini</>
                }
              </button>
            </div>

            {aiResponse && (
              <div className="border border-zinc-800/60 rounded-xl p-5 bg-zinc-900/20">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <p className="text-xs text-zinc-500 font-mono">Gemini response</p>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {aiResponse}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}
