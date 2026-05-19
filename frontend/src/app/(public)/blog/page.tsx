import { getBlogPosts } from "@/lib/portfolio-api"
import { BlogPost } from "@/types/portfolio"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
      <div className="mb-10">
        <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">Writing</p>
        <h1 className="text-3xl font-medium text-white">Blog</h1>
      </div>

      {!posts.length && (
        <div className="text-center py-20 border border-zinc-800/50 rounded-xl">
          <p className="text-zinc-600 font-mono text-sm">No posts published yet</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post: BlogPost) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <article className="group border border-zinc-800/60 rounded-xl p-5
                                bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40
                                transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-white font-medium mb-1 group-hover:text-amber-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors shrink-0 mt-1" />
              </div>
              {post.published_at && (
                <p className="text-zinc-600 text-xs font-mono mt-3">
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                  })}
                </p>
              )}
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}