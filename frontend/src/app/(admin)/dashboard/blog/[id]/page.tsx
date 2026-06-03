"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Topbar } from "@/components/admin/topbar"
import { BlogForm } from "@/components/admin/blog-form"
import { api } from "@/lib/api"

interface BlogPostDetail {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  is_published: boolean
  published_at: string | null
  featured: boolean
}

export default function EditBlogPostPage() {
  const params = useParams<{ id: string }>()
  const [post, setPost] = useState<BlogPostDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/portfolio/blog/${params.id}/`).then((res) => {
      setPost(res.data)
    }).finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <>
        <Topbar title="Edit post" />
        <main className="flex-1 px-6 py-6">
          <p className="text-zinc-600 font-mono text-sm">Loading...</p>
        </main>
      </>
    )
  }

  if (!post) {
    return (
      <>
        <Topbar title="Edit post" />
        <main className="flex-1 px-6 py-6">
          <p className="text-red-400 font-mono text-sm">Post not found</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Topbar title={`Edit — ${post.title}`} description={post.slug} />
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6">
        <BlogForm
          initial={{
            ...post,
            published_at: post.published_at || "",
          }}
          postId={post.id}
        />
      </main>
    </>
  )
}
