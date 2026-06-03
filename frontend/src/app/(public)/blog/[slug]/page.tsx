import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getBlogPost, getBlogPosts } from "@/lib/portfolio-api"
import { BlogPost } from "@/types/portfolio"
import { ArrowLeft, Calendar, Clock, Eye, Tag } from "lucide-react"

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getBlogPosts()
  return posts.map((p: BlogPost) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  if (!post) return { title: "Post not found" }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published_at,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getBlogPost(params.slug)
  if (!post) notFound()

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">

      {/* Back */}
      <Link href="/blog"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white
                   text-sm transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        All posts
      </Link>

      <article>
        {/* Category */}
        {post.category && (
          <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-3">
            {post.category}
          </p>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-medium text-white mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-zinc-500 text-sm mb-6 flex-wrap">
          {post.published_at && (
            <span className="flex items-center gap-1.5 font-mono text-xs">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.published_at).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
              })}
            </span>
          )}
          <span className="flex items-center gap-1.5 font-mono text-xs">
            <Clock className="w-3.5 h-3.5" />
            {post.reading_time_minutes} min read
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs">
            <Eye className="w-3.5 h-3.5" />
            {post.view_count} views
          </span>
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {post.tags.map((tag: string) => (
              <Link key={tag} href={`/blog?tag=${tag}`}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1
                           rounded-lg bg-zinc-800 text-zinc-400 hover:text-white
                           font-mono transition-colors">
                <Tag className="w-3 h-3" />
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-zinc-800/60 mb-8" />

        {/* Content */}
        <div className="prose-content text-zinc-400 leading-relaxed whitespace-pre-wrap
                        text-sm sm:text-base">
          {post.content}
        </div>
      </article>
    </div>
  )
}
