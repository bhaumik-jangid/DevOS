"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { api } from "@/lib/api"
import { FormField, Input, Textarea, Select, Toggle } from "./form-field"
import { TagInput } from "./tag-input"

interface ProjectFormData {
  name: string
  slug: string
  description: string
  long_description: string
  stack_tags: string[]
  github_url: string
  live_url: string
  frontend_url: string
  backend_url: string
  health_endpoint: string
  status: string
  hosting_provider: string
  deployment_type: string
  docker_enabled: boolean
  ci_cd_enabled: boolean
  is_featured: boolean
  is_public: boolean
  notes: string
  order: number
}

const defaults: ProjectFormData = {
  name: "", slug: "", description: "", long_description: "",
  stack_tags: [], github_url: "", live_url: "",
  frontend_url: "", backend_url: "", health_endpoint: "",
  status: "active", hosting_provider: "", deployment_type: "",
  docker_enabled: false, ci_cd_enabled: false,
  is_featured: false, is_public: true, notes: "", order: 0,
}

interface Props {
  initial?: Partial<ProjectFormData>
  projectId?: number
}

export function ProjectForm({ initial, projectId }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<ProjectFormData>({ ...defaults, ...initial })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (key: keyof ProjectFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    set("name", name)
    if (!projectId) {
      set("slug", name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      if (projectId) {
        await api.patch(`/projects/${projectId}/`, form)
        toast.success("Project updated")
      } else {
        await api.post("/projects/", form)
        toast.success("Project created")
      }
      router.push("/dashboard/projects")
      router.refresh()
    } catch (err: any) {
      const data = err.response?.data
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
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">

      {/* Basic info */}
      <section>
        <h2 className="text-xs text-zinc-600 font-mono uppercase tracking-widest mb-4">
          Basic information
        </h2>
        <div className="space-y-4">
          <FormField label="Project name" required error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Awesome Project"
              required
            />
          </FormField>

          <FormField label="Slug" hint="Auto-generated from name. Used in URLs." error={errors.slug}>
            <Input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="my-awesome-project"
            />
          </FormField>

          <FormField label="Short description" required error={errors.description}>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="One or two sentences describing the project"
              rows={2}
              required
            />
          </FormField>

          <FormField label="Full description" hint="Shown on project detail page" error={errors.long_description}>
            <Textarea
              value={form.long_description}
              onChange={(e) => set("long_description", e.target.value)}
              placeholder="Detailed writeup..."
              rows={5}
            />
          </FormField>

          <FormField label="Stack tags" hint="Press Enter or comma to add a tag">
            <TagInput
              tags={form.stack_tags}
              onChange={(tags) => set("stack_tags", tags)}
              placeholder="Next.js, Django, Docker..."
            />
          </FormField>
        </div>
      </section>

      {/* URLs */}
      <section>
        <h2 className="text-xs text-zinc-600 font-mono uppercase tracking-widest mb-4">
          URLs & repository
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="GitHub URL" error={errors.github_url}>
              <Input
                value={form.github_url}
                onChange={(e) => set("github_url", e.target.value)}
                placeholder="https://github.com/user/repo"
                type="url"
              />
            </FormField>
            <FormField label="Live URL" error={errors.live_url}>
              <Input
                value={form.live_url}
                onChange={(e) => set("live_url", e.target.value)}
                placeholder="https://myproject.dev"
                type="url"
              />
            </FormField>
            <FormField label="Frontend URL" error={errors.frontend_url}>
              <Input
                value={form.frontend_url}
                onChange={(e) => set("frontend_url", e.target.value)}
                placeholder="https://app.myproject.dev"
                type="url"
              />
            </FormField>
            <FormField label="Backend URL" error={errors.backend_url}>
              <Input
                value={form.backend_url}
                onChange={(e) => set("backend_url", e.target.value)}
                placeholder="https://api.myproject.dev"
                type="url"
              />
            </FormField>
          </div>
          <FormField label="Health endpoint" hint="URL DevOS will ping to check uptime" error={errors.health_endpoint}>
            <Input
              value={form.health_endpoint}
              onChange={(e) => set("health_endpoint", e.target.value)}
              placeholder="https://api.myproject.dev/health/"
              type="url"
            />
          </FormField>
        </div>
      </section>

      {/* Deployment */}
      <section>
        <h2 className="text-xs text-zinc-600 font-mono uppercase tracking-widest mb-4">
          Deployment & infrastructure
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Status" error={errors.status}>
              <Select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="maintenance">Maintenance</option>
                <option value="archived">Archived</option>
              </Select>
            </FormField>
            <FormField label="Hosting provider" error={errors.hosting_provider}>
              <Select
                value={form.hosting_provider}
                onChange={(e) => set("hosting_provider", e.target.value)}>
                <option value="">Select provider</option>
                <option value="vercel">Vercel</option>
                <option value="render">Render</option>
                <option value="railway">Railway</option>
                <option value="aws">AWS</option>
                <option value="digitalocean">DigitalOcean</option>
                <option value="vps">VPS</option>
                <option value="other">Other</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Deployment type" hint="e.g. Docker Compose, GitHub Actions, manual">
            <Input
              value={form.deployment_type}
              onChange={(e) => set("deployment_type", e.target.value)}
              placeholder="Docker Compose + GitHub Actions"
            />
          </FormField>
          <div className="flex flex-col gap-3 pt-1">
            <Toggle
              label="Docker enabled"
              checked={form.docker_enabled}
              onChange={(v) => set("docker_enabled", v)}
            />
            <Toggle
              label="CI/CD enabled"
              checked={form.ci_cd_enabled}
              onChange={(v) => set("ci_cd_enabled", v)}
            />
          </div>
        </div>
      </section>

      {/* Visibility */}
      <section>
        <h2 className="text-xs text-zinc-600 font-mono uppercase tracking-widest mb-4">
          Visibility & display
        </h2>
        <div className="flex flex-col gap-3">
          <Toggle
            label="Public — visible on portfolio"
            checked={form.is_public}
            onChange={(v) => set("is_public", v)}
          />
          <Toggle
            label="Featured — shown on landing page"
            checked={form.is_featured}
            onChange={(v) => set("is_featured", v)}
          />
        </div>
        <div className="mt-4">
          <FormField label="Display order" hint="Lower numbers appear first">
            <Input
              type="number"
              value={form.order}
              onChange={(e) => set("order", parseInt(e.target.value) || 0)}
              className="w-24"
            />
          </FormField>
        </div>
      </section>

      {/* Notes */}
      <section>
        <h2 className="text-xs text-zinc-600 font-mono uppercase tracking-widest mb-4">
          Internal notes
        </h2>
        <FormField label="Notes" hint="Private — not shown publicly">
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Deployment credentials location, known issues, TODOs..."
            rows={3}
          />
        </FormField>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/60">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                     disabled:bg-amber-500/40 text-black text-sm font-medium
                     px-4 py-2.5 rounded-lg transition-colors">
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving</>
          ) : (
            <><Save className="w-4 h-4" /> {projectId ? "Save changes" : "Create project"}</>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/projects")}
          className="text-sm text-zinc-500 hover:text-white transition-colors px-4 py-2.5">
          Cancel
        </button>
      </div>
    </form>
  )
}
