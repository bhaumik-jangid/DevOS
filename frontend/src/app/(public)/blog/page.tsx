import type { Metadata } from "next"
import Link from "next/link"
import { getBlogPosts } from "@/lib/portfolio-api"
import { BlogPost } from "@/types/portfolio"
import { ArrowUpRight, Clock, Eye, Tag, BookOpen } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on engineering, DevOps, full-stack development, and building systems.",
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group border border-zinc-800/60 rounded-xl p-5
                          bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40
                          transition-all duration-200 h-full flex flex-col">

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {post.tags.slice(0, 3).map((tag: string) => (
              <span key={tag}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                           rounded bg-zinc-800 text-zinc-400 font-mono">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="text-white font-medium mb-2 group-hover:text-amber-400
                       transition-colors leading-snug flex-1">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-zinc-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-zinc-600 text-xs font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.reading_time_minutes}m read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {post.view_count}
            </span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600
                                    group-hover:text-amber-400 transition-colors" />
        </div>

        {/* Date */}
        {post.published_at && (
          <p className="text-zinc-700 text-xs font-mono mt-2">
            {new Date(post.published_at).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric"
            })}
          </p>
        )}
      </article>
    </Link>
  )
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  const allTags = Array.from(
    new Set(posts.flatMap((p: BlogPost) => p.tags))
  )

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 max-w-5xl mx-auto">

      <div className="mb-10">
        <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
          Writing
        </p>
        <h1 className="text-3xl font-medium text-white mb-3">Blog</h1>
        <p className="text-zinc-500 text-sm max-w-md">
          Engineering notes, tutorials, and thoughts on building production systems.
        </p>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <span className="text-xs text-zinc-600 font-mono mr-1">Filter:</span>
          {allTags.map((tag: string) => (
            <Link key={tag} href={`/blog?tag=${tag}`}
              className="text-xs px-2.5 py-1 rounded-lg border border-zinc-800
                         text-zinc-500 hover:text-white hover:border-zinc-600
                         font-mono transition-colors">
              {tag}
            </Link>
          ))}
        </div>
      )}

      {!posts.length ? (
        <div className="text-center py-20 border border-zinc-800/50 rounded-xl">
          <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-600 font-mono text-sm">No posts published yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post: BlogPost) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
