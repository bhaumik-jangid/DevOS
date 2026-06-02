import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getBlogPost, getBlogPosts } from "@/lib/portfolio-api"
import { ArrowLeft, Calendar, Tag } from "lucide-react"

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  if (!post) return { title: "Post not found" }
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPost(params.slug)
  if (!post) notFound()

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">

      <Link href="/blog"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white
                   text-sm transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        All posts
      </Link>

      <article>
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {post.tags.map((tag: string) => (
              <span key={tag}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded
                           bg-zinc-800 text-zinc-400 font-mono">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-medium text-white mb-4">
          {post.title}
        </h1>

        {post.published_at && (
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-8">
            <Calendar className="w-4 h-4" />
            {new Date(post.published_at).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric"
            })}
          </div>
        )}

        <div className="text-zinc-400 leading-relaxed whitespace-pre-wrap
                        border-t border-zinc-800/60 pt-8">
          {post.content}
        </div>
      </article>
    </div>
  )
}
