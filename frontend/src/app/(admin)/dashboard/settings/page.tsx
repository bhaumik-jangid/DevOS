"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Save, Loader2, User, Link2, Mail, Briefcase,
  Globe, Layers, Shield, Bell, ChevronRight
} from "lucide-react"
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

interface ServiceToggle {
  key: string
  label: string
  description: string
  enabled: boolean
}

const SERVICES: Omit<ServiceToggle, "enabled">[] = [
  { key: "portfolio", label: "Portfolio", description: "Public portfolio, blog, contact form" },
  { key: "projects", label: "Projects", description: "Project registry and monitoring" },
  { key: "shortener", label: "URL Shortener", description: "Personal short link management" },
  { key: "watchlist", label: "Watchlist", description: "Streaming tracker and AI recommendations" },
  { key: "mcp", label: "MCP & AI", description: "AI assistant and MCP tool explorer" },
]

type SettingsSection = "profile" | "social" | "availability" | "services" | "security"

const SECTIONS: { key: SettingsSection; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "social", label: "Social & Contact", icon: Link2 },
  { key: "availability", label: "Availability", icon: Briefcase },
  { key: "services", label: "Microservices", icon: Layers },
  { key: "security", label: "Security", icon: Shield },
]

const defaultConfig: SiteConfig = {
  name: "", tagline: "", email: "", phone: "",
  github_url: "", linkedin_url: "", location: "",
  available_for_work: true,
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [enabledServices, setEnabledServices] = useState<string[]>([
    "portfolio", "projects", "shortener", "watchlist", "mcp"
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile")

  useEffect(() => {
    Promise.all([
      api.get("/portfolio/config/"),
      api.get("/core/services/").catch(() => ({ data: { enabled: [] } })),
    ]).then(([configRes, servicesRes]) => {
      setConfig((prev) => ({ ...prev, ...configRes.data }))
      if (servicesRes.data.enabled?.length) {
        setEnabledServices(servicesRes.data.enabled)
      }
    }).catch(() => {
      toast.error("Failed to load settings")
    }).finally(() => setLoading(false))
  }, [])

  const set = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }))

  const toggleService = (key: string) => {
    setEnabledServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        api.post("/portfolio/config/update/", config),
        api.post("/core/services/update/", { enabled: enabledServices }),
      ])
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
        description="Platform configuration"
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400
                       disabled:bg-amber-500/40 text-black text-xs font-medium
                       px-3 py-1.5 rounded-lg transition-colors">
            {saving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving</>
              : <><Save className="w-3.5 h-3.5" />Save all</>
            }
          </button>
        }
      />

      <main className="flex-1 flex min-h-0">
        {/* Settings nav — phone settings style */}
        <div className="w-52 shrink-0 border-r border-zinc-800/60 overflow-y-auto">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full flex items-center gap-3 px-4 py-3
                             text-sm transition-colors text-left
                             ${activeSection === section.key
                               ? "bg-zinc-800/60 text-white"
                               : "text-zinc-500 hover:text-white hover:bg-zinc-800/20"
                             }`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span>{section.label}</span>
                {activeSection === section.key && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-500" />
                )}
              </button>
            )
          })}
        </div>

        {/* Settings content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-lg space-y-6">

            {activeSection === "profile" && (
              <>
                <h2 className="text-sm font-medium text-white">Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      Full name
                    </label>
                    <input
                      value={config.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Your name"
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
                  <div>
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
              </>
            )}

            {activeSection === "social" && (
              <>
                <h2 className="text-sm font-medium text-white">Social & Contact</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <input type="email" value={config.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@domain.dev" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      Phone
                    </label>
                    <input type="tel" value={config.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+91 98765 43210" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      GitHub URL
                    </label>
                    <input value={config.github_url}
                      onChange={(e) => set("github_url", e.target.value)}
                      placeholder="https://github.com/username" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      LinkedIn URL
                    </label>
                    <input value={config.linkedin_url}
                      onChange={(e) => set("linkedin_url", e.target.value)}
                      placeholder="https://linkedin.com/in/username" className={inputCls} />
                  </div>
                </div>
              </>
            )}

            {activeSection === "availability" && (
              <>
                <h2 className="text-sm font-medium text-white">Availability</h2>
                <div className="border border-zinc-800/60 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Open to work</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Shows green availability badge on portfolio hero
                      </p>
                    </div>
                    <button
                      onClick={() => set("available_for_work", !config.available_for_work)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        config.available_for_work ? "bg-emerald-500" : "bg-zinc-700"
                      }`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white
                                       transition-transform duration-200 ${
                        config.available_for_work ? "translate-x-5" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeSection === "services" && (
              <>
                <h2 className="text-sm font-medium text-white">Microservices</h2>
                <p className="text-xs text-zinc-500">
                  Toggle which services are active. Disabled services are hidden
                  from the sidebar and their routes return 503.
                </p>
                <div className="space-y-2">
                  {SERVICES.map((service) => (
                    <div key={service.key}
                      className="border border-zinc-800/60 rounded-xl p-4
                                 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">{service.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {service.description}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleService(service.key)}
                        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                          enabledServices.includes(service.key)
                            ? "bg-amber-500"
                            : "bg-zinc-700"
                        }`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white
                                         transition-transform duration-200 ${
                          enabledServices.includes(service.key)
                            ? "translate-x-5"
                            : "translate-x-0.5"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === "security" && (
              <>
                <h2 className="text-sm font-medium text-white">Security</h2>
                <div className="space-y-3">
                  <div className="border border-zinc-800/60 rounded-xl p-4">
                    <p className="text-sm text-white mb-1">Admin panel URL</p>
                    <p className="text-xs text-zinc-500 mb-2">
                      Your Django admin is at a custom path for security.
                    </p>
                    <code className="text-xs text-amber-400 font-mono">
                      /devos-control/
                    </code>
                  </div>
                  <div className="border border-zinc-800/60 rounded-xl p-4">
                    <p className="text-sm text-white mb-1">JWT token lifetime</p>
                    <p className="text-xs text-zinc-500">
                      Access tokens expire in 60 minutes. Refresh tokens last 7 days.
                    </p>
                  </div>
                  <div className="border border-zinc-800/60 rounded-xl p-4">
                    <p className="text-sm text-white mb-1">Rate limiting</p>
                    <p className="text-xs text-zinc-500">
                      Contact form: 5 requests per hour per IP in production.
                      MCP endpoints: authenticated only.
                    </p>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </>
  )
}
