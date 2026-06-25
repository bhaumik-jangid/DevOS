"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Send, Loader2 } from "lucide-react"

interface ContactFormProps {
  page?: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
  detail?: string
}

export function ContactForm({ page = "/" }: ContactFormProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setErrors({})

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090/api/v1"
      const res = await fetch(`${API}/portfolio/contact////`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          page,
          referrer: typeof document !== "undefined" ? document.referrer : "",
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (typeof data === "object" && !data.detail) {
          setErrors(data as FormErrors)
          toast.error("Please fix the errors below")
        } else {
          toast.error(data.detail || "Failed to send message")
        }
        return
      }
      toast.success("Message sent — I will get back to you soon")
      setSent(true)
    } catch {
      toast.error("Network error — please try again")
    } finally {
      setSending(false)
    }
  }

  const inputCls = (field: keyof FormErrors) =>
    `w-full bg-[#1a1a1c] border rounded-lg px-3 py-2.5
     text-white text-sm placeholder-zinc-600
     focus:outline-none focus:ring-1 transition-colors
     ${errors[field]
       ? "border-red-500/50 focus:border-red-500/40 focus:ring-red-500/20"
       : "border-zinc-800 focus:border-amber-500/60 focus:ring-amber-500/20"
     }`

  if (sent) {
    return (
      <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-6 text-center">
        <p className="text-emerald-400 font-medium mb-1">Message received</p>
        <p className="text-zinc-500 text-sm">I will get back to you as soon as possible.</p>
      </div>
    )
  }

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
            className={inputCls("name")}
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name}</p>
          )}
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
            className={inputCls("email")}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
          Phone <span className="text-zinc-700">(optional)</span>
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+91 98765 43210"
          className={inputCls("name")}
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
          placeholder="Tell me about your project or opportunity..."
          className={`${inputCls("message")} resize-none`}
        />
        {errors.message && (
          <p className="text-red-400 text-xs mt-1">{errors.message}</p>
        )}
      </div>

      {errors.detail && (
        <p className="text-red-400 text-xs border border-red-500/20
                       bg-red-500/5 rounded-lg px-3 py-2">
          {errors.detail}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                   disabled:bg-amber-500/40 text-black text-sm font-medium
                   px-4 py-2.5 rounded-lg transition-colors min-h-[48px]">
        {sending
          ? <><Loader2 className="w-4 h-4 animate-spin" />Sending</>
          : <><Send className="w-4 h-4" />Send message</>
        }
      </button>
    </form>
  )
}
