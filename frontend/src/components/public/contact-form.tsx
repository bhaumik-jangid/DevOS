"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Send, Loader2 } from "lucide-react"

export function ContactForm() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", message: ""
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090/api/v1"
      const res = await fetch(`${API}/portfolio/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed")
      toast.success("Message sent — I will get back to you soon")
      setSent(true)
    } catch (err: any) {
      toast.error(err.message || "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-6 text-center">
        <p className="text-emerald-400 font-medium mb-1">Message received</p>
        <p className="text-zinc-500 text-sm">I will get back to you as soon as possible.</p>
      </div>
    )
  }

  const inputCls = `w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2.5
                    text-white text-sm placeholder-zinc-600
                    focus:outline-none focus:border-amber-500/60 focus:ring-1
                    focus:ring-amber-500/20 transition-colors`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
            Name <span className="text-amber-500">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            placeholder="Your name"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
            Email <span className="text-amber-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            placeholder="you@example.com"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
          Phone <span className="text-zinc-600">(optional)</span>
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+91 98765 43210"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
          Message <span className="text-amber-500">*</span>
        </label>
        <textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          required
          rows={5}
          placeholder="What would you like to discuss?"
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                   disabled:bg-amber-500/40 text-black text-sm font-medium
                   px-4 py-2.5 rounded-lg transition-colors">
        {sending ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Sending</>
        ) : (
          <><Send className="w-4 h-4" />Send message</>
        )}
      </button>
    </form>
  )
}
