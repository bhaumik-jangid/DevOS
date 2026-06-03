"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Save, Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"
import { FormField, Input, Textarea, Toggle } from "./form-field"
import { TagInput } from "./tag-input"

interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  is_published: boolean
  published_at: string
  featured: boolean
}

interface BlogFormProps {
  initial?: Partial<BlogFormData>
  postId?: number
}

const defaults: BlogFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  tags: [],
  is_published: false,
  published_at: "",
  featured: false,
}

export function BlogForm({ initial, postId }: BlogFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<BlogFormData>({ ...defaults, ...initial })
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = <K extends keyof BlogFormData>(key: K, value: BlogFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  const handleTitleChange = (title: string) => {
    set("title", title)
    if (!postId) {
      set("slug", title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/(^-|-$)/g, ""))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    const payload = {
      ...form,
      published_at: form.is_published && !form.published_at
        ? new Date().toISOString()
        : form.published_at || null,
    }

    try {
      if (postId) {
        await api.patch(`/portfolio/blog/${postId}/`, payload)
        toast.success("Post updated")
      } else {
        await api.post("/portfolio/blog/", payload)
        toast.success("Post created")
      }
      router.push("/dashboard/blog")
      router.refresh()
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: Record<string, string | string[]> } }).response
        const data = response?.data
        if (data && typeof data === "object") {
          const fieldErrors: Record<string, string> = {}
          Object.entries(data).forEach(([key, val]) => {
            fieldErrors[key] = Array.isArray(val) ? val[0] : String(val)
          })
          setErrors(fieldErrors)
          toast.error("Fix the errors below")
        } else {
          toast.error("Something went wrong")
        }
      } else {
        toast.error("Something went wrong")
      }
    } finally {
      setSaving(false)
    }
  }

  const wordCount = form.content.split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.round(wordCount / 200))

  return (
    <div className="max-w-3xl">
      {/* Word count bar */}
      <div className="flex items-center justify-between mb-6 px-1">
        <p className="text-xs text-zinc-600 font-mono">
          {wordCount} words · {readingTime} min read
        </p>
        <button type="button" onClick={() => setPreview((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-zinc-500
                     hover:text-white transition-colors">
          {preview
            ? <><EyeOff className="w-3.5 h-3.5" />Edit</>
            : <><Eye className="w-3.5 h-3.5" />Preview</>
          }
        </button>
      </div>

      {preview ? (
        <div className="border border-zinc-800/60 rounded-xl p-6 bg-zinc-900/20">
          <h1 className="text-2xl font-medium text-white mb-2">{form.title || "Untitled"}</h1>
          <p className="text-zinc-500 text-sm mb-6 border-b border-zinc-800/60 pb-4">
            {form.excerpt}
          </p>
          <div className="prose-content text-zinc-400 text-sm leading-relaxed
                          whitespace-pre-wrap">
            {form.content || "No content yet."}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic info */}
          <section className="space-y-4">
            <h2 className="text-xs text-zinc-600 font-mono uppercase tracking-widest">
              Post details
            </h2>

            <FormField label="Title" required error={errors.title}>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Post title"
                required
              />
            </FormField>

            <FormField label="Slug" hint="Auto-generated from title" error={errors.slug}>
              <Input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="post-slug"
              />
            </FormField>

            <FormField label="Excerpt" hint="Short summary shown in listings" required>
              <Textarea
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                placeholder="Brief description of the post..."
                rows={2}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Category">
                <Input
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  placeholder="Engineering, DevOps, Tutorial..."
                />
              </FormField>
              <FormField label="Tags" hint="Press Enter to add">
                <TagInput
                  tags={form.tags}
                  onChange={(tags) => set("tags", tags)}
                  placeholder="django, nextjs, docker..."
                />
              </FormField>
            </div>
          </section>

          {/* Content */}
          <section className="space-y-4">
            <h2 className="text-xs text-zinc-600 font-mono uppercase tracking-widest">
              Content
            </h2>
            <FormField
              label="Body"
              hint="Markdown supported — use ``` for code blocks"
              required
              error={errors.content}>
              <Textarea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder="Write your post here..."
                rows={20}
                className="font-mono text-xs leading-relaxed"
              />
            </FormField>
          </section>

          {/* Publishing */}
          <section className="space-y-4">
            <h2 className="text-xs text-zinc-600 font-mono uppercase tracking-widest">
              Publishing
            </h2>
            <div className="flex flex-col gap-3">
              <Toggle
                label="Published — visible on blog"
                checked={form.is_published}
                onChange={(v) => set("is_published", v)}
              />
              <Toggle
                label="Featured — shown at top of blog"
                checked={form.featured}
                onChange={(v) => set("featured", v)}
              />
            </div>
            {form.is_published && (
              <FormField
                label="Publish date"
                hint="Leave empty to use current time">
                <Input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => set("published_at", e.target.value)}
                />
              </FormField>
            )}
          </section>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/60">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                         disabled:bg-amber-500/40 text-black text-sm font-medium
                         px-4 py-2.5 rounded-lg transition-colors">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving</>
                : <><Save className="w-4 h-4" />{postId ? "Save changes" : "Create post"}</>
              }
            </button>
            <button type="button"
              onClick={() => router.push("/dashboard/blog")}
              className="text-sm text-zinc-500 hover:text-white transition-colors px-4 py-2.5">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
