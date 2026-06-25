"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { Send, Loader2, Bot, User, Wrench, RotateCcw } from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

interface Message {
  role: "user" | "assistant"
  content: string
  tools_called?: string[]
  error?: string
}

const SUGGESTED_QUERIES = [
  "Which projects are currently unhealthy?",
  "Summarize yesterday's deployments",
  "Are there any open incidents?",
  "What is the deployment success rate this week?",
  "Show me the latest contact submissions",
  "Which project has the lowest uptime?",
]

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
        ${isUser
          ? "bg-amber-500/10 border border-amber-500/20"
          : "bg-zinc-800 border border-zinc-700"
        }`}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-amber-400" />
          : <Bot className="w-3.5 h-3.5 text-zinc-400" />
        }
      </div>

      <div className={`flex-1 max-w-2xl ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {message.tools_called && message.tools_called.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {message.tools_called.map((tool) => (
              <span key={tool}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                           rounded bg-zinc-800 border border-zinc-700
                           text-zinc-500 font-mono">
                <Wrench className="w-2.5 h-2.5" />
                {tool}
              </span>
            ))}
          </div>
        )}

        <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed
          ${isUser
            ? "bg-amber-500/10 border border-amber-500/20 text-zinc-200"
            : message.error
              ? "bg-red-500/10 border border-red-500/20 text-red-300"
              : "bg-zinc-900 border border-zinc-800 text-zinc-300"
          }`}>
          {message.error || message.content}
        </div>
      </div>
    </div>
  )
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const buildHistory = (msgs: Message[]) => {
    return msgs.map((m) => ({
      role: m.role,
      content: m.content,
    }))
  }

  const handleSend = async (text?: string) => {
    const message = (text || input).trim()
    if (!message || loading) return

    const userMessage: Message = { role: "user", content: message }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await api.post("/mcp/chat/", {
        message,
        history: buildHistory(messages),
      })

      const assistantMessage: Message = {
        role: "assistant",
        content: res.data.response || "",
        tools_called: res.data.tools_called || [],
        error: res.data.error || undefined,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      toast.error("Failed to get response")
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          error: "Request failed. Check your API key and network.",
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleReset = () => {
    setMessages([])
    setInput("")
    inputRef.current?.focus()
  }

  return (
    <>
      <Topbar
        title="AI Assistant"
        description="Natural language queries against live DevOS data"
        actions={
          messages.length > 0 ? (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-zinc-500
                         hover:text-white transition-colors px-3 py-1.5
                         border border-zinc-800 rounded-lg">
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          ) : undefined
        }
      />

      <main className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 py-4">

        {/* Empty state with suggestions */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700
                              flex items-center justify-center mx-auto mb-4">
                <Bot className="w-5 h-5 text-zinc-400" />
              </div>
              <h2 className="text-white font-medium mb-1">DevOS Assistant</h2>
              <p className="text-zinc-500 text-sm max-w-sm">
                Ask anything about your projects, deployments, incidents, or alerts.
                The assistant has live access to your platform data.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED_QUERIES.map((query) => (
                <button
                  key={query}
                  onClick={() => handleSend(query)}
                  className="text-left px-3 py-2.5 rounded-xl border border-zinc-800
                             bg-zinc-900/40 text-zinc-400 text-xs hover:border-zinc-700
                             hover:text-white transition-colors">
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message thread */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.map((message, i) => (
              <MessageBubble key={i} message={message} />
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700
                                flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800
                                flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
                  <span className="text-zinc-600 text-sm font-mono">
                    Querying DevOS data...
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="border border-zinc-800/60 rounded-xl bg-zinc-900/40
                        flex items-end gap-2 p-2 mt-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your projects, deployments, or incidents..."
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600
                       resize-none focus:outline-none px-2 py-1.5 max-h-32
                       scrollbar-thin scrollbar-thumb-zinc-700"
            style={{ minHeight: "36px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = "auto"
              target.style.height = Math.min(target.scrollHeight, 128) + "px"
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400
                       disabled:bg-zinc-800 disabled:text-zinc-600
                       text-black text-xs font-medium px-3 py-2 rounded-lg
                       transition-colors shrink-0 min-h-9">
            {loading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Send className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        <p className="text-zinc-700 text-xs text-center mt-2 font-mono">
          Enter to send · Shift+Enter for new line
        </p>
      </main>
    </>
  )
}
