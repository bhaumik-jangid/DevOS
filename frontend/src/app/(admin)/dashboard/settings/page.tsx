"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Save, Loader2 } from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { FormField, Input } from "@/components/admin/form-field"
import { api } from "@/lib/api"

const CONFIG_FIELDS = [
  { key: "github_url", label: "GitHub URL", placeholder: "https://github.com/username" },
  { key: "linkedin_url", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/username" },
  { key: "twitter_url", label: "Twitter / X URL", placeholder: "https://twitter.com/username" },
  { key: "email", label: "Contact email", placeholder: "you@domain.dev" },
  { key: "phone", label: "Phone number", placeholder: "+91 XXXXX XXXXX" },
  { key: "hero_video_url", label: "Hero video URL", placeholder: "https://example.com/video.mp4" },
  { key: "leetcode_username", label: "LeetCode username", placeholder: "your-leetcode-handle" },
]

export default function SettingsPage() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/portfolio/config/").then((res) => {
      setConfig(res.data)
    }).finally(() => setLoading(false))
  }, [])

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

  return (
    <>
      <Topbar
        title="Settings"
        description="Site configuration and social links"
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400
                       disabled:bg-amber-500/40 text-black text-xs font-medium
                       px-3 py-1.5 rounded-lg transition-colors">
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save
          </button>
        }
      />
      <main className="flex-1 px-4 sm:px-6 py-6">
        {loading ? (
          <p className="text-zinc-600 text-sm font-mono">Loading...</p>
        ) : (
          <div className="max-w-lg space-y-4">
            {CONFIG_FIELDS.map((field) => (
              <FormField key={field.key} label={field.label}>
                <Input
                  value={config[field.key] || ""}
                  onChange={(e) => setConfig((p) => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                />
              </FormField>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
