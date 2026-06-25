"use client"

import { useEffect, useState } from "react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"
import { Mail, CheckCircle, Send } from "lucide-react"

interface Submission {
  id: number
  name: string
  email: string
  phone: string
  message: string
  page: string
  ip_address: string | null
  submitted_at: string
  is_read: boolean
  telegram_sent: boolean
}

export default function ContactsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Submission | null>(null)

  useEffect(() => {
    api.get("/portfolio/contact////submissions/").then((res) => {
      setSubmissions(res.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Topbar
        title="Contact submissions"
        description={`${submissions.length} total messages`}
      />
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">

          {/* List */}
          <div className="border border-zinc-800/60 rounded-xl overflow-hidden lg:col-span-1">
            <div className="divide-y divide-zinc-800/40">
              {loading && (
                <div className="px-5 py-8 text-center">
                  <p className="text-zinc-600 text-sm font-mono">Loading...</p>
                </div>
              )}
              {!loading && !submissions.length && (
                <div className="px-5 py-8 text-center">
                  <p className="text-zinc-600 text-sm font-mono">No submissions yet</p>
                </div>
              )}
              {submissions.map((sub) => (
                <button key={sub.id} onClick={() => setSelected(sub)}
                  className={`w-full text-left px-4 py-3 hover:bg-zinc-800/20
                              transition-colors ${selected?.id === sub.id ? "bg-zinc-800/30" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{sub.name}</p>
                      <p className="text-xs text-zinc-600 truncate">{sub.email}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {sub.telegram_sent && (
                        <Send className="w-3 h-3 text-emerald-500" />
                      )}
                      {!sub.is_read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 font-mono mt-0.5">
                    {new Date(sub.submitted_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="border border-zinc-800/60 rounded-xl p-5 lg:col-span-2">
            {!selected ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Mail className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-600 text-sm font-mono">Select a message</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-white font-medium">{selected.name}</h2>
                    <a href={`mailto:${selected.email}`}
                      className="text-amber-500/80 text-sm hover:text-amber-400 transition-colors">
                      {selected.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    {selected.telegram_sent && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
                        <CheckCircle className="w-3 h-3" />Telegram sent
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  {selected.phone && (
                    <div>
                      <p className="text-zinc-600 mb-0.5">Phone</p>
                      <p className="text-zinc-300">{selected.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-zinc-600 mb-0.5">Page</p>
                    <p className="text-zinc-300">{selected.page}</p>
                  </div>
                  {selected.ip_address && (
                    <div>
                      <p className="text-zinc-600 mb-0.5">IP</p>
                      <p className="text-zinc-300">{selected.ip_address}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-zinc-600 mb-0.5">Submitted</p>
                    <p className="text-zinc-300">
                      {new Date(selected.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/60">
                  <p className="text-xs text-zinc-600 font-mono mb-2">Message</p>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
