"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Save, Loader2, User, Link2, Briefcase,
  Layers, Shield, ChevronRight, Play,
  ImageIcon, Plus, Trash2, Upload
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

interface ProfileMedia {
  hero_video: string
  video_tooltips: string[]
  photo_primary: string | null
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

type SettingsSection = "profile" | "social" | "availability" | "services" | "security" | "media" | "photo"

const SECTIONS: { key: SettingsSection; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "social", label: "Social & Contact", icon: Link2 },
  { key: "availability", label: "Availability", icon: Briefcase },
  { key: "services", label: "Microservices", icon: Layers },
  { key: "media", label: "Video Bubble", icon: Play },
  { key: "photo", label: "Profile Photo", icon: ImageIcon },
  { key: "security", label: "Security", icon: Shield },
]

const defaultConfig: SiteConfig = {
  name: "", tagline: "", email: "", phone: "",
  github_url: "", linkedin_url: "", location: "",
  available_for_work: true,
}

const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || ""

export default function SettingsPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [media, setMedia] = useState<ProfileMedia>({
    hero_video: "", video_tooltips: [], photo_primary: null
  })
  const [newTooltip, setNewTooltip] = useState("")
  const [enabledServices, setEnabledServices] = useState<string[]>([
    "portfolio", "projects", "shortener", "watchlist", "mcp"
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile")
  const photoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      api.get("/portfolio/config/"),
      api.get("/portfolio/profile////"),
      api.get("/core/services/").catch(() => ({ data: { enabled: [] } })),
    ]).then(([configRes, profileRes, servicesRes]) => {
      setConfig((prev) => ({ ...prev, ...configRes.data }))
      setMedia({
        hero_video: profileRes.data.hero_video || "",
        video_tooltips: profileRes.data.video_tooltips || [],
        photo_primary: profileRes.data.photo_primary || null,
      })
      if (servicesRes.data.enabled?.length) {
        setEnabledServices(servicesRes.data.enabled)
      }
    }).catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false))
  }, [])

  const set = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }))

  const toggleService = (key: string) =>
    setEnabledServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )

  const addTooltip = () => {
    const t = newTooltip.trim()
    if (!t) return
    console.log("Adding tooltip:", t)
    setMedia((prev) => ({
      ...prev,
      video_tooltips: [...prev.video_tooltips, t]
    }))
    setNewTooltip("")
  }

  const removeTooltip = (i: number) =>
    setMedia((prev) => ({
      ...prev,
      video_tooltips: prev.video_tooltips.filter((_, idx) => idx !== i)
    }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        api.post("/portfolio/config/update/", config),
        api.post("/core/services/update/", { enabled: enabledServices }),
        // Save video tooltips to profile
        api.patch("/portfolio/profile////update/", {
          video_tooltips: media.video_tooltips,
          hero_video: media.hero_video,
        }).catch(() => {}),
      ])
      toast.success("Settings saved")
      //reload components that depend on config and media
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB")
      return
    }

    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append("photo", file)

    try {
      const res = await api.post("/portfolio/profile////photo/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setMedia((prev) => ({ ...prev, photo_primary: res.data.photo_primary }))
      toast.success("Photo uploaded successfully")
    } catch {
      toast.error("Failed to upload photo")
    } finally {
      setUploadingPhoto(false)
      if (photoRef.current) photoRef.current.value = ""
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
          <button onClick={handleSave} disabled={saving}
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
        {/* Nav */}
        <div className="w-48 shrink-0 border-r border-zinc-800/60 overflow-y-auto">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <button key={section.key} onClick={() => setActiveSection(section.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm
                             transition-colors text-left
                             ${activeSection === section.key
                               ? "bg-zinc-800/60 text-white"
                               : "text-zinc-500 hover:text-white hover:bg-zinc-800/20"
                             }`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{section.label}</span>
                {activeSection === section.key && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-500 shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-lg space-y-5">

            {/* Profile */}
            {activeSection === "profile" && (
              <>
                <h2 className="text-sm font-medium text-white">Profile</h2>
                <div className="space-y-4">
                  {[
                    { key: "name", label: "Full name", placeholder: "Your name" },
                    { key: "tagline", label: "Tagline", placeholder: "Full-stack Engineer" },
                    { key: "location", label: "Location", placeholder: "Ludhiana, India" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs text-zinc-500 font-mono
                                         uppercase tracking-wider mb-1.5">
                        {label}
                      </label>
                      <input
                        value={config[key as keyof SiteConfig] as string}
                        onChange={(e) => set(key as keyof SiteConfig, e.target.value)}
                        placeholder={placeholder}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Social */}
            {activeSection === "social" && (
              <>
                <h2 className="text-sm font-medium text-white">Social & Contact</h2>
                <div className="space-y-4">
                  {[
                    { key: "email", label: "Email", type: "email", placeholder: "you@domain.dev" },
                    { key: "phone", label: "Phone", type: "tel", placeholder: "+91 98765 43210" },
                    { key: "github_url", label: "GitHub URL", type: "url", placeholder: "https://github.com/username" },
                    { key: "linkedin_url", label: "LinkedIn URL", type: "url", placeholder: "https://linkedin.com/in/username" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs text-zinc-500 font-mono
                                         uppercase tracking-wider mb-1.5">
                        {label}
                      </label>
                      <input
                        type={type}
                        value={config[key as keyof SiteConfig] as string}
                        onChange={(e) => set(key as keyof SiteConfig, e.target.value)}
                        placeholder={placeholder}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Availability */}
            {activeSection === "availability" && (
              <>
                <h2 className="text-sm font-medium text-white">Availability</h2>
                <div className="border border-zinc-800/60 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Open to work</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Shows green badge on portfolio hero section
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

            {/* Microservices */}
            {activeSection === "services" && (
              <>
                <h2 className="text-sm font-medium text-white">Microservices</h2>
                <p className="text-xs text-zinc-500">
                  Toggle which services appear in the sidebar.
                </p>
                <div className="space-y-2">
                  {SERVICES.map((service) => (
                    <div key={service.key}
                      className="border border-zinc-800/60 rounded-xl p-4
                                 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">{service.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{service.description}</p>
                      </div>
                      <button onClick={() => toggleService(service.key)}
                        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                          enabledServices.includes(service.key) ? "bg-amber-500" : "bg-zinc-700"
                        }`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white
                                         transition-transform duration-200 ${
                          enabledServices.includes(service.key) ? "translate-x-5" : "translate-x-0.5"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Video bubble */}
            {activeSection === "media" && (
              <>
                <h2 className="text-sm font-medium text-white">Video Bubble</h2>
                <p className="text-xs text-zinc-500">
                  The floating video circle shown on all pages. Upload a short MP4 via Django admin
                  then paste the Cloudinary URL here.
                </p>

                <div>
                  <label className="block text-xs text-zinc-500 font-mono
                                     uppercase tracking-wider mb-1.5">
                    Video URL (Cloudinary or direct MP4 URL)
                  </label>
                  <input
                    value={media.hero_video}
                    onChange={(e) => setMedia((p) => ({ ...p, hero_video: e.target.value }))}
                    placeholder="https://res.cloudinary.com/.../video.mp4"
                    className={inputCls}
                  />
                  <p className="text-xs text-zinc-600 mt-1">
                    Upload video via Django admin → Profile → Hero video, then copy URL here
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 font-mono
                                     uppercase tracking-wider mb-3">
                    Tooltip messages
                    <span className="text-zinc-600 ml-1 normal-case">
                      ({media.video_tooltips.length} messages)
                    </span>
                  </label>
                  <div className="space-y-2 mb-3">
                    {media.video_tooltips.map((tooltip, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg
                                         px-3 py-2 text-zinc-300 text-sm">
                          {tooltip}
                        </div>
                        <button onClick={() => removeTooltip(i)}
                          className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newTooltip}
                      onChange={(e) => setNewTooltip(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTooltip() } }}
                      placeholder="Add a tooltip message..."
                      className={`${inputCls} flex-1`}
                    />
                    <button onClick={addTooltip}
                      className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400
                                 hover:text-white rounded-lg transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">
                    Press Enter or click + to add. Shown randomly when bubble is clicked.
                  </p>
                </div>
              </>
            )}

            {/* Profile photo */}
            {activeSection === "photo" && (
              <>
                <h2 className="text-sm font-medium text-white">Profile Photo</h2>
                <p className="text-xs text-zinc-500">
                  Upload a new hero image. Uploads directly to Cloudinary and updates
                  the portfolio hero section.
                </p>

                {media.photo_primary && (
                  <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-zinc-800/60">
                      <p className="text-xs text-zinc-500 font-mono">Current photo</p>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={media.photo_primary.startsWith("http")
                        ? media.photo_primary
                        : `${BACKEND}${media.photo_primary}`
                      }
                      alt="Current profile photo"
                      className="w-full max-h-48 object-cover"
                    />
                    <div className="px-4 py-2">
                      <p className="text-xs text-zinc-600 font-mono truncate">
                        {media.photo_primary}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => photoRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="flex items-center gap-2 border border-dashed border-zinc-700
                               hover:border-amber-500/40 text-zinc-400 hover:text-amber-400
                               rounded-xl px-5 py-4 w-full transition-colors
                               disabled:opacity-50 justify-center">
                    {uploadingPhoto ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Uploading to Cloudinary...</>
                    ) : (
                      <><Upload className="w-4 h-4" />Click to upload new photo</>
                    )}
                  </button>
                  <p className="text-xs text-zinc-600 mt-1.5">
                    Max 10MB. Landscape photos work best (you on the right half).
                  </p>
                </div>
              </>
            )}

            {/* Security */}
            {activeSection === "security" && (
              <>
                <h2 className="text-sm font-medium text-white">Security</h2>
                <div className="space-y-3">
                  {[
                    {
                      title: "Admin panel URL",
                      desc: "Moved to custom path for security.",
                      value: "/devos-control/"
                    },
                    {
                      title: "JWT access token",
                      desc: "Expires after 60 minutes.",
                      value: "60 minutes"
                    },
                    {
                      title: "JWT refresh token",
                      desc: "Rotated and blacklisted on use.",
                      value: "7 days"
                    },
                    {
                      title: "Contact form rate limit",
                      desc: "Per IP, production only.",
                      value: "5 / hour"
                    },
                  ].map((item) => (
                    <div key={item.title}
                      className="border border-zinc-800/60 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white">{item.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                        </div>
                        <code className="text-xs text-amber-400 font-mono shrink-0 ml-3">
                          {item.value}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </>
  )
}
