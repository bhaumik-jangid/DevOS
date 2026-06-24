"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Plus, Copy, Trash2, ExternalLink, Link2,
  Loader2, CheckCircle, XCircle, Pencil, X, Save
} from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

interface ShortLink {
  id: number
  code: string
  original_url: string
  title: string
  description: string
  click_count: number
  is_active: boolean
  is_expired: boolean
  short_path: string
  created_at: string
  expires_at: string | null
}

interface FormErrors {
  code?: string
  original_url?: string
  title?: string
  non_field_errors?: string
  detail?: string
}

interface NewLinkForm {
  code: string
  original_url: string
  title: string
  description: string
  expires_at: string
}

const BASE_URL = typeof window !== "undefined"
  ? window.location.origin
  : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8090")

const defaultForm: NewLinkForm = {
  code: "", original_url: "", title: "", description: "", expires_at: ""
}

export default function ShortenerPage() {
  const [links, setLinks] = useState<ShortLink[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<NewLinkForm>(defaultForm)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null)
  const [editForm, setEditForm] = useState({
    original_url: "", title: "", description: "", is_active: true
  })
  const [editErrors, setEditErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  const fetchLinks = () => {
    api.get("/shortener/").then((res) => {
      setLinks(res.data.results || res.data)
    }).catch(() => toast.error("Failed to load links"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLinks() }, [])

  const setF = <K extends keyof NewLinkForm>(k: K, v: NewLinkForm[K]) => {
    setForm((p) => ({ ...p, [k]: v }))
    if (formErrors[k as keyof FormErrors]) {
      setFormErrors((p) => ({ ...p, [k]: undefined }))
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setFormErrors({})
    try {
      const payload: Partial<NewLinkForm> = {
        original_url: form.original_url,
        title: form.title,
        description: form.description,
      }
      if (form.code.trim()) payload.code = form.code.trim()
      if (form.expires_at) payload.expires_at = form.expires_at

      await api.post("/shortener/", payload)
      toast.success("Short link created")
      setShowForm(false)
      setForm(defaultForm)
      fetchLinks()
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const data = (err as { response?: { data?: FormErrors } }).response?.data
        if (data) {
          setFormErrors(data)
          if (data.code) toast.error(`Code error: ${data.code}`)
          else if (data.original_url) toast.error(`URL error: ${data.original_url}`)
          else toast.error("Please fix the errors below")
        } else {
          toast.error("Failed to create link")
        }
      }
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = (link: ShortLink) => {
    setEditingLink(link)
    setEditForm({
      original_url: link.original_url,
      title: link.title,
      description: link.description,
      is_active: link.is_active,
    })
    setEditErrors({})
  }

  const handleSaveEdit = async () => {
    if (!editingLink) return
    setSaving(true)
    setEditErrors({})
    try {
      await api.patch(`/shortener/${editingLink.id}/`, editForm)
      toast.success("Link updated")
      setEditingLink(null)
      fetchLinks()
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const data = (err as { response?: { data?: FormErrors } }).response?.data
        if (data) {
          setEditErrors(data)
          toast.error("Fix the errors below")
        } else {
          toast.error("Failed to update")
        }
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete /${code}? This cannot be undone.`)) return
    try {
      await api.delete(`/shortener/${id}/`)
      toast.success("Link deleted")
      fetchLinks()
    } catch {
      toast.error("Failed to delete")
    }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(`${BASE_URL}/s/${code}`)
    toast.success("Copied to clipboard")
  }

  const inputCls = (error?: string) =>
    `w-full bg-[#1a1a1c] border rounded-lg px-3 py-2.5 text-white text-sm
     placeholder-zinc-600 focus:outline-none focus:ring-1 transition-colors
     ${error
       ? "border-red-500/50 focus:border-red-500/40 focus:ring-red-500/20"
       : "border-zinc-800 focus:border-amber-500/60 focus:ring-amber-500/20"
     }`

  return (
    <>
      <Topbar
        title="URL Shortener"
        description={`${links.length} links · ${BASE_URL}/s/<code>`}
        actions={
          <button onClick={() => { setShowForm((v) => !v); setFormErrors({}) }}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400
                       text-black text-xs font-medium px-3 py-1.5 rounded-lg
                       transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New link
          </button>
        }
      />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 overflow-auto">

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate}
            className="border border-zinc-800/60 rounded-xl p-5 space-y-4 bg-zinc-900/20">
            <h3 className="text-sm font-medium text-white">New short link</h3>

            <div>
              <label className="block text-xs text-zinc-500 font-mono
                                 uppercase tracking-wider mb-1.5">
                Destination URL <span className="text-amber-500">*</span>
              </label>
              <input
                value={form.original_url}
                onChange={(e) => setF("original_url", e.target.value)}
                placeholder="https://example.com/very-long-url"
                required
                className={inputCls(formErrors.original_url)}
              />
              {formErrors.original_url && (
                <p className="text-red-400 text-xs mt-1">{formErrors.original_url}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">
                  Custom code
                  <span className="text-zinc-600 ml-1 normal-case">(optional)</span>
                </label>
                <input
                  value={form.code}
                  onChange={(e) => setF("code", e.target.value)}
                  placeholder="my-link"
                  className={inputCls(formErrors.code)}
                />
                {formErrors.code ? (
                  <p className="text-red-400 text-xs mt-1">{formErrors.code}</p>
                ) : (
                  <p className="text-zinc-600 text-xs mt-1">
                    Auto-generated if left empty
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setF("title", e.target.value)}
                  placeholder="Link title"
                  className={inputCls()}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 font-mono
                                 uppercase tracking-wider mb-1.5">
                Expires at
                <span className="text-zinc-600 ml-1 normal-case">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setF("expires_at", e.target.value)}
                className={inputCls()}
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={creating}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                           disabled:bg-amber-500/40 text-black text-sm font-medium
                           px-4 py-2 rounded-lg transition-colors">
                {creating
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Creating</>
                  : <><Plus className="w-4 h-4" />Create</>
                }
              </button>
              <button type="button"
                onClick={() => { setShowForm(false); setFormErrors({}) }}
                className="text-sm text-zinc-500 hover:text-white transition-colors px-4 py-2">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Edit modal */}
        {editingLink && (
          <div className="fixed inset-0 z-50 flex items-center justify-center
                           bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-[#111113] border border-zinc-800/60 rounded-2xl
                            p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">Edit link</h3>
                  <p className="text-xs text-zinc-600 font-mono mt-0.5">
                    Code <span className="text-amber-400">/{editingLink.code}</span> is permanent
                  </p>
                </div>
                <button onClick={() => setEditingLink(null)}
                  className="p-1.5 text-zinc-600 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">
                  Destination URL <span className="text-amber-500">*</span>
                </label>
                <input
                  value={editForm.original_url}
                  onChange={(e) => setEditForm((p) => ({ ...p, original_url: e.target.value }))}
                  className={inputCls(editErrors.original_url)}
                />
                {editErrors.original_url && (
                  <p className="text-red-400 text-xs mt-1">{editErrors.original_url}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Link title"
                  className={inputCls()}
                />
              </div>

              <div className="flex items-center justify-between border border-zinc-800/60
                               rounded-xl p-3">
                <span className="text-sm text-zinc-300">Active</span>
                <button
                  onClick={() => setEditForm((p) => ({ ...p, is_active: !p.is_active }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    editForm.is_active ? "bg-amber-500" : "bg-zinc-700"
                  }`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white
                                   transition-transform duration-200 ${
                    editForm.is_active ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveEdit} disabled={saving}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                             disabled:bg-amber-500/40 text-black text-sm font-medium
                             px-4 py-2 rounded-lg transition-colors">
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Saving</>
                    : <><Save className="w-4 h-4" />Save changes</>
                  }
                </button>
                <button onClick={() => setEditingLink(null)}
                  className="text-sm text-zinc-500 hover:text-white transition-colors px-4 py-2">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Links table */}
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/60
                          hidden sm:grid grid-cols-12 gap-3
                          text-xs text-zinc-600 font-mono uppercase tracking-wider">
            <div className="col-span-2">Code</div>
            <div className="col-span-4">Destination</div>
            <div className="col-span-2">Title</div>
            <div className="col-span-1 text-center">Clicks</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-zinc-800/40">
            {loading && (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-600 text-sm font-mono">Loading...</p>
              </div>
            )}
            {!loading && !links.length && (
              <div className="px-5 py-12 text-center">
                <Link2 className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-600 text-sm font-mono">No links yet</p>
              </div>
            )}

            {links.map((link) => (
              <div key={link.id}
                className="px-4 sm:px-5 py-3.5 grid grid-cols-1 sm:grid-cols-12
                           gap-2 sm:gap-3 items-center hover:bg-zinc-800/10 transition-colors">
                <div className="sm:col-span-2">
                  <code className="text-amber-400 text-sm font-mono">/s/{link.code}</code>
                </div>
                <div className="sm:col-span-4 min-w-0">
                  <p className="text-zinc-400 text-xs truncate font-mono">
                    {link.original_url}
                  </p>
                </div>
                <div className="sm:col-span-2 min-w-0">
                  <p className="text-zinc-300 text-sm truncate">{link.title || "—"}</p>
                </div>
                <div className="sm:col-span-1 text-center">
                  <span className="text-zinc-300 text-sm font-mono">{link.click_count}</span>
                </div>
                <div className="sm:col-span-1 flex justify-center">
                  {link.is_expired ? (
                    <span className="text-xs text-zinc-600 font-mono">expired</span>
                  ) : link.is_active ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-zinc-600" />
                  )}
                </div>
                <div className="sm:col-span-2 flex items-center gap-1 justify-end">
                  <button onClick={() => handleCopy(link.code)}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600
                               hover:text-white transition-colors" title="Copy URL">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a href={link.original_url} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600
                               hover:text-white transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button onClick={() => handleEdit(link)}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600
                               hover:text-amber-400 transition-colors" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(link.id, link.code)}
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
