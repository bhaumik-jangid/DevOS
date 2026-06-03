"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Plus, Eye, EyeOff, Pencil, Trash2, BookOpen, Clock } from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

interface BlogPostRow {
  id: number
  title: string
  slug: string
  is_published: boolean
  published_at: string | null
  view_count: number
  reading_time_minutes: number
  tags: string[]
  category: string
  featured: boolean
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = () => {
    api.get("/portfolio/blog/").then((res) => {
      setPosts(res.data.results || res.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchPosts() }, [])

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await api.delete(`/portfolio/blog/${id}/`)
      toast.success(`"${title}" deleted`)
      fetchPosts()
    } catch {
      toast.error("Failed to delete post")
    }
  }

  return (
    <>
      <Topbar
        title="Blog"
        description="Manage posts and articles"
        actions={
          <Link href="/dashboard/blog/new"
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400
                       text-black text-xs font-medium px-3 py-1.5 rounded-lg
                       transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New post
          </Link>
        }
      />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6">
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden">

          {/* Header row */}
          <div className="px-5 py-3 border-b border-zinc-800/60
                          grid grid-cols-12 gap-3 text-xs text-zinc-600
                          font-mono uppercase tracking-wider hidden sm:grid">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Stats</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Actions</div>
          </div>

          <div className="divide-y divide-zinc-800/40">
            {loading && (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-600 text-sm font-mono">Loading...</p>
              </div>
            )}
            {!loading && !posts.length && (
              <div className="px-5 py-12 text-center">
                <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-600 text-sm font-mono">No posts yet</p>
                <Link href="/dashboard/blog/new"
                  className="text-amber-500 text-xs font-mono mt-2 inline-block">
                  Write your first post
                </Link>
              </div>
            )}

            {posts.map((post) => (
              <div key={post.id}
                className="px-4 sm:px-5 py-3.5 flex sm:grid sm:grid-cols-12
                           gap-3 items-center hover:bg-zinc-800/20 transition-colors">

                {/* Title */}
                <div className="flex-1 sm:col-span-5 min-w-0">
                  <div className="flex items-center gap-2">
                    {post.featured && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10
                                       text-amber-400 font-mono shrink-0">
                        Featured
                      </span>
                    )}
                    <p className="text-sm text-white font-medium truncate">
                      {post.title}
                    </p>
                  </div>
                  {post.category && (
                    <p className="text-xs text-zinc-600 font-mono mt-0.5">{post.category}</p>
                  )}
                </div>

                {/* Status */}
                <div className="hidden sm:flex sm:col-span-2 items-center gap-1.5">
                  {post.is_published ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs text-emerald-400 font-mono">Published</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="text-xs text-zinc-600 font-mono">Draft</span>
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="hidden sm:flex sm:col-span-2 items-center gap-3
                                text-xs text-zinc-600 font-mono">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.view_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.reading_time_minutes}m
                  </span>
                </div>

                {/* Date */}
                <div className="hidden sm:block sm:col-span-2">
                  <p className="text-xs text-zinc-600 font-mono">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric"
                        })
                      : "Not published"
                    }
                  </p>
                </div>

                {/* Actions */}
                <div className="sm:col-span-1 flex items-center gap-1 shrink-0">
                  <Link href={`/dashboard/blog/${post.id}`}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600
                               hover:text-white transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600
                               hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
