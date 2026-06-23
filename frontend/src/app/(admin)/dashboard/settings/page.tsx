"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Save, Loader2, User, Link, MapPin, Mail, Phone, Briefcase } from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

interface SiteConfig {
  name: string
  tagline: string
  email: string
  phone: string
  github_url: string
  linkedin_url: string
  location: string
  available_for_work: boolean
}

const defaultConfig: SiteConfig = {
  name: "",
  tagline: "",
  email: "",
  phone: "",
  github_url: "",
  linkedin_url: "",
  location: "",
  available_for_work: true,
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get("/portfolio/config/").then((res) => {
      setConfig((prev) => ({ ...prev, ...res.data }))
    }).catch(() => {
      toast.error("Failed to load settings")
    }).finally(() => setLoading(false))
  }, [])

  const set = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post("/portfolio/config/update/", config)
      toast.success("Settings saved")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const inputCls = `w-full bg-[#1a1a1c] border border-zinc-800 rounded-lg px-3 py-2.5
                    text-white text-sm placeholder-zinc-600
                    focus:outline-none focus:border-amber-500/60 focus:ring-1
                    focus:ring-amber-500/20 transition-colors`

  if (loading) {
    return (
      <>
        <Topbar title="Settings" />
        <main className="flex-1 px-6 py-6">
          <p className="text-zinc-600 font-mono text-sm">Loading...</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Topbar
        title="Settings"
        description="Manage your portfolio configuration"
      />
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-2xl space-y-8">

          {/* Identity */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-3.5 h-3.5 text-amber-500" />
              <h2 className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
                Identity
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">
                  Full name
                </label>
                <input
                  value={config.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Bhaumik Jangid"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">
                  Tagline
                </label>
                <input
                  value={config.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="Full-stack Engineer"
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-3.5 h-3.5 text-amber-500" />
              <h2 className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
                Contact
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@domain.dev"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={config.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <input
                  value={config.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Ludhiana, India"
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          {/* Social */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Link className="w-3.5 h-3.5 text-amber-500" />
              <h2 className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
                Social links
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">
                  GitHub URL
                </label>
                <input
                  value={config.github_url}
                  onChange={(e) => set("github_url", e.target.value)}
                  placeholder="https://github.com/username"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">
                  LinkedIn URL
                </label>
                <input
                  value={config.linkedin_url}
                  onChange={(e) => set("linkedin_url", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          {/* Availability */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-3.5 h-3.5 text-amber-500" />
              <h2 className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
                Availability
              </h2>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("available_for_work", !config.available_for_work)}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer
                  ${config.available_for_work ? "bg-emerald-500" : "bg-zinc-700"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white
                                 transition-transform duration-200
                                 ${config.available_for_work ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-zinc-300">
                {config.available_for_work
                  ? "Available for work — shown as green badge on portfolio"
                  : "Not available — badge hidden on portfolio"
                }
              </span>
            </label>
          </section>

          {/* Save */}
          <div className="pt-4 border-t border-zinc-800/60">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                         disabled:bg-amber-500/40 text-black text-sm font-medium
                         px-4 py-2.5 rounded-lg transition-colors">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving</>
                : <><Save className="w-4 h-4" />Save settings</>
              }
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
