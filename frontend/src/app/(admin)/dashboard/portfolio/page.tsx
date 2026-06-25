"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Plus, Trash2, Pencil, Save, Loader2,
  Briefcase, Code2, X, GripVertical
} from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

interface Skill {
  id: number
  name: string
  category: string
  proficiency: number
  order: number
  icon_name: string
}

interface Experience {
  id: number
  role: string
  company: string
  location: string
  description: string
  start_date: string
  end_date: string | null
  is_current: boolean
  order: number
}

type ActiveTab = "skills" | "experience"

const SKILL_CATEGORIES = [
  "language", "framework", "devops", "database", "tool"
]

const CATEGORY_LABELS: Record<string, string> = {
  language: "Language", framework: "Framework",
  devops: "DevOps", database: "Database", tool: "Tool"
}

const defaultSkill = {
  name: "", category: "language", proficiency: 80, order: 0, icon_name: ""
}

const defaultExp = {
  role: "", company: "", location: "",
  description: "", start_date: "", end_date: "", is_current: false, order: 0
}

const inputCls = `w-full bg-[#1a1a1c] border border-zinc-800 rounded-lg px-3 py-2.5
                  text-white text-sm placeholder-zinc-600
                  focus:outline-none focus:border-amber-500/60 focus:ring-1
                  focus:ring-amber-500/20 transition-colors`

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("skills")
  const [skills, setSkills] = useState<Skill[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [editingExp, setEditingExp] = useState<Experience | null>(null)
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [showExpForm, setShowExpForm] = useState(false)
  const [newSkill, setNewSkill] = useState(defaultSkill)
  const [newExp, setNewExp] = useState(defaultExp)
  const [saving, setSaving] = useState(false)

  const fetchAll = () => {
    Promise.all([
      api.get("/portfolio/skills/admin/").catch(() => api.get("/portfolio/skills/")),
      api.get("/portfolio/experience/admin/").catch(() => api.get("/portfolio/experience/")),
    ]).then(([skillsRes, expRes]) => {
      setSkills(skillsRes.data.results || skillsRes.data)
      setExperiences(expRes.data.results || expRes.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  // Skills CRUD
  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post("/portfolio/skills/admin/", newSkill)
      toast.success("Skill added")
      setShowSkillForm(false)
      setNewSkill(defaultSkill)
      fetchAll()
    } catch { toast.error("Failed to add skill") }
    finally { setSaving(false) }
  }

  const handleUpdateSkill = async () => {
    if (!editingSkill) return
    setSaving(true)
    try {
      await api.patch(`/portfolio/skills/admin/${editingSkill.id}/`, editingSkill)
      toast.success("Skill updated")
      setEditingSkill(null)
      fetchAll()
    } catch { toast.error("Failed to update") }
    finally { setSaving(false) }
  }

  const handleDeleteSkill = async (id: number, name: string) => {
    if (!confirm(`Delete skill "${name}"?`)) return
    try {
      await api.delete(`/portfolio/skills/admin/${id}/`)
      toast.success("Skill deleted")
      fetchAll()
    } catch { toast.error("Failed to delete") }
  }

  // Experience CRUD
  const handleCreateExp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...newExp,
        end_date: newExp.is_current ? null : newExp.end_date || null,
      }
      await api.post("/portfolio/experience/admin/", payload)
      toast.success("Experience added")
      setShowExpForm(false)
      setNewExp(defaultExp)
      fetchAll()
    } catch { toast.error("Failed to add experience") }
    finally { setSaving(false) }
  }

  const handleUpdateExp = async () => {
    if (!editingExp) return
    setSaving(true)
    try {
      const payload = {
        ...editingExp,
        end_date: editingExp.is_current ? null : editingExp.end_date || null,
      }
      await api.patch(`/portfolio/experience/admin/${editingExp.id}/`, payload)
      toast.success("Experience updated")
      setEditingExp(null)
      fetchAll()
    } catch { toast.error("Failed to update") }
    finally { setSaving(false) }
  }

  const handleDeleteExp = async (id: number, role: string) => {
    if (!confirm(`Delete "${role}"?`)) return
    try {
      await api.delete(`/portfolio/experience/admin/${id}/`)
      toast.success("Deleted")
      fetchAll()
    } catch { toast.error("Failed to delete") }
  }

  return (
    <>
      <Topbar title="Portfolio" description="Manage skills and experience" />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 overflow-auto">

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
          {(["skills", "experience"] as ActiveTab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                           transition-colors capitalize
                           ${activeTab === tab
                             ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                             : "text-zinc-500 hover:text-white"
                           }`}>
              {tab === "skills"
                ? <Code2 className="w-3.5 h-3.5" />
                : <Briefcase className="w-3.5 h-3.5" />
              }
              {tab}
              <span className="text-xs font-mono text-zinc-600">
                ({tab === "skills" ? skills.length : experiences.length})
              </span>
            </button>
          ))}
        </div>

        {/* Skills tab */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowSkillForm((v) => !v)}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400
                           text-black text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Add skill
              </button>
            </div>

            {/* Add skill form */}
            {showSkillForm && (
              <form onSubmit={handleCreateSkill}
                className="border border-zinc-800/60 rounded-xl p-5 space-y-4 bg-zinc-900/20">
                <h3 className="text-sm font-medium text-white">New skill</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      Name <span className="text-amber-500">*</span>
                    </label>
                    <input value={newSkill.name} required
                      onChange={(e) => setNewSkill((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Python" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select value={newSkill.category}
                      onChange={(e) => setNewSkill((p) => ({ ...p, category: e.target.value }))}
                      className={`${inputCls} cursor-pointer`}>
                      {SKILL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      Proficiency: {newSkill.proficiency}%
                    </label>
                    <input type="range" min="10" max="100" step="5"
                      value={newSkill.proficiency}
                      onChange={(e) => setNewSkill((p) => ({
                        ...p, proficiency: parseInt(e.target.value)
                      }))}
                      className="w-full accent-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      Order
                    </label>
                    <input type="number" value={newSkill.order}
                      onChange={(e) => setNewSkill((p) => ({
                        ...p, order: parseInt(e.target.value) || 0
                      }))}
                      className={inputCls} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                               disabled:bg-amber-500/40 text-black text-sm font-medium
                               px-4 py-2 rounded-lg transition-colors">
                    {saving
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Saving</>
                      : <><Plus className="w-4 h-4" />Add</>
                    }
                  </button>
                  <button type="button" onClick={() => setShowSkillForm(false)}
                    className="text-sm text-zinc-500 hover:text-white transition-colors px-4 py-2">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Skills grouped by category */}
            {loading ? (
              <p className="text-zinc-600 font-mono text-sm">Loading...</p>
            ) : (
              SKILL_CATEGORIES.map((cat) => {
                const catSkills = skills.filter((s) => s.category === cat)
                if (!catSkills.length) return null
                return (
                  <div key={cat}>
                    <p className="text-xs text-zinc-600 font-mono uppercase
                                   tracking-wider mb-2">
                      {CATEGORY_LABELS[cat]}
                    </p>
                    <div className="space-y-1.5">
                      {catSkills.map((skill) => (
                        <div key={skill.id}
                          className="border border-zinc-800/60 rounded-xl px-4 py-3
                                     flex items-center gap-3 hover:bg-zinc-800/10 transition-colors">
                          <GripVertical className="w-4 h-4 text-zinc-700 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium">{skill.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden max-w-24">
                                <div className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${skill.proficiency}%` }} />
                              </div>
                              <span className="text-xs text-zinc-600 font-mono">
                                {skill.proficiency}%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => setEditingSkill({ ...skill })}
                              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600
                                         hover:text-amber-400 transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteSkill(skill.id, skill.name)}
                              className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600
                                         hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Experience tab */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowExpForm((v) => !v)}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400
                           text-black text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Add experience
              </button>
            </div>

            {/* Add experience form */}
            {showExpForm && (
              <form onSubmit={handleCreateExp}
                className="border border-zinc-800/60 rounded-xl p-5 space-y-4 bg-zinc-900/20">
                <h3 className="text-sm font-medium text-white">New experience</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      Role <span className="text-amber-500">*</span>
                    </label>
                    <input value={newExp.role} required
                      onChange={(e) => setNewExp((p) => ({ ...p, role: e.target.value }))}
                      placeholder="Software Engineer" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      Company <span className="text-amber-500">*</span>
                    </label>
                    <input value={newExp.company} required
                      onChange={(e) => setNewExp((p) => ({ ...p, company: e.target.value }))}
                      placeholder="Company Name" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      Location
                    </label>
                    <input value={newExp.location}
                      onChange={(e) => setNewExp((p) => ({ ...p, location: e.target.value }))}
                      placeholder="Remote / City" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      Start date <span className="text-amber-500">*</span>
                    </label>
                    <input type="date" value={newExp.start_date} required
                      onChange={(e) => setNewExp((p) => ({ ...p, start_date: e.target.value }))}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 font-mono
                                       uppercase tracking-wider mb-1.5">
                      End date
                    </label>
                    <input type="date" value={newExp.end_date}
                      disabled={newExp.is_current}
                      onChange={(e) => setNewExp((p) => ({ ...p, end_date: e.target.value }))}
                      className={`${inputCls} disabled:opacity-50`} />
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <input type="checkbox" id="current-new"
                      checked={newExp.is_current}
                      onChange={(e) => setNewExp((p) => ({ ...p, is_current: e.target.checked }))}
                      className="w-4 h-4 accent-amber-500" />
                    <label htmlFor="current-new" className="text-sm text-zinc-300 cursor-pointer">
                      Currently working here
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 font-mono
                                     uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea value={newExp.description} rows={3}
                    onChange={(e) => setNewExp((p) => ({ ...p, description: e.target.value }))}
                    placeholder="What did you work on..."
                    className={`${inputCls} resize-none`} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                               disabled:bg-amber-500/40 text-black text-sm font-medium
                               px-4 py-2 rounded-lg transition-colors">
                    {saving
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Saving</>
                      : <><Plus className="w-4 h-4" />Add</>
                    }
                  </button>
                  <button type="button" onClick={() => setShowExpForm(false)}
                    className="text-sm text-zinc-500 hover:text-white transition-colors px-4 py-2">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Experience list */}
            {loading ? (
              <p className="text-zinc-600 font-mono text-sm">Loading...</p>
            ) : !experiences.length ? (
              <div className="text-center py-12 border border-zinc-800/60 rounded-xl">
                <Briefcase className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-600 text-sm font-mono">No experience added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div key={exp.id}
                    className="border border-zinc-800/60 rounded-xl p-4 sm:p-5
                               hover:bg-zinc-800/10 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{exp.role}</p>
                        <p className="text-amber-500/80 text-sm">{exp.company}</p>
                        {exp.location && (
                          <p className="text-zinc-600 text-xs mt-0.5">{exp.location}</p>
                        )}
                        <p className="text-zinc-600 text-xs font-mono mt-1">
                          {exp.start_date}
                          {" — "}
                          {exp.is_current
                            ? <span className="text-emerald-400">Present</span>
                            : exp.end_date || ""
                          }
                        </p>
                        {exp.description && (
                          <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setEditingExp({ ...exp })}
                          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600
                                     hover:text-amber-400 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteExp(exp.id, exp.role)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600
                                     hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Skill Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
                         bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#111113] border border-zinc-800/60 rounded-2xl
                          p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Edit skill</h3>
              <button onClick={() => setEditingSkill(null)}
                className="p-1.5 text-zinc-600 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">Name</label>
                <input value={editingSkill.name}
                  onChange={(e) => setEditingSkill((p) => p ? { ...p, name: e.target.value } : p)}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">Category</label>
                <select value={editingSkill.category}
                  onChange={(e) => setEditingSkill((p) => p ? { ...p, category: e.target.value } : p)}
                  className={`${inputCls} cursor-pointer`}>
                  {SKILL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">
                  Proficiency: {editingSkill.proficiency}%
                </label>
                <input type="range" min="10" max="100" step="5"
                  value={editingSkill.proficiency}
                  onChange={(e) => setEditingSkill((p) =>
                    p ? { ...p, proficiency: parseInt(e.target.value) } : p
                  )}
                  className="w-full accent-amber-500" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleUpdateSkill} disabled={saving}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                           disabled:bg-amber-500/40 text-black text-sm font-medium
                           px-4 py-2 rounded-lg transition-colors">
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Saving</>
                  : <><Save className="w-4 h-4" />Save</>
                }
              </button>
              <button onClick={() => setEditingSkill(null)}
                className="text-sm text-zinc-500 hover:text-white transition-colors px-4 py-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Experience Modal */}
      {editingExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
                         bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#111113] border border-zinc-800/60 rounded-2xl
                          p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Edit experience</h3>
              <button onClick={() => setEditingExp(null)}
                className="p-1.5 text-zinc-600 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "role", label: "Role", placeholder: "Software Engineer" },
                { key: "company", label: "Company", placeholder: "Company Name" },
                { key: "location", label: "Location", placeholder: "Remote" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className={key === "location" ? "" : ""}>
                  <label className="block text-xs text-zinc-500 font-mono
                                     uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    value={editingExp[key as keyof Experience] as string}
                    onChange={(e) => setEditingExp((p) =>
                      p ? { ...p, [key]: e.target.value } : p
                    )}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">Start date</label>
                <input type="date" value={editingExp.start_date}
                  onChange={(e) => setEditingExp((p) =>
                    p ? { ...p, start_date: e.target.value } : p
                  )}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-mono
                                   uppercase tracking-wider mb-1.5">End date</label>
                <input type="date" value={editingExp.end_date || ""}
                  disabled={editingExp.is_current}
                  onChange={(e) => setEditingExp((p) =>
                    p ? { ...p, end_date: e.target.value } : p
                  )}
                  className={`${inputCls} disabled:opacity-50`} />
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <input type="checkbox" id="current-edit"
                  checked={editingExp.is_current}
                  onChange={(e) => setEditingExp((p) =>
                    p ? { ...p, is_current: e.target.checked } : p
                  )}
                  className="w-4 h-4 accent-amber-500" />
                <label htmlFor="current-edit" className="text-sm text-zinc-300 cursor-pointer">
                  Currently working here
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 font-mono
                                 uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={editingExp.description} rows={3}
                onChange={(e) => setEditingExp((p) =>
                  p ? { ...p, description: e.target.value } : p
                )}
                className={`${inputCls} resize-none`} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleUpdateExp} disabled={saving}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                           disabled:bg-amber-500/40 text-black text-sm font-medium
                           px-4 py-2 rounded-lg transition-colors">
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Saving</>
                  : <><Save className="w-4 h-4" />Save</>
                }
              </button>
              <button onClick={() => setEditingExp(null)}
                className="text-sm text-zinc-500 hover:text-white transition-colors px-4 py-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
