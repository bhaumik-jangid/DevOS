"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Cpu, Play, ChevronRight, CheckCircle, XCircle } from "lucide-react"
import { Topbar } from "@/components/admin/topbar"
import { api } from "@/lib/api"

interface ToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, {
      type: string
      description: string
      default?: unknown
      enum?: string[]
    }>
    required: string[]
  }
}

interface ToolResult {
  tool: string
  result: unknown
  error?: string
}

export default function MCPPage() {
  const [tools, setTools] = useState<ToolDefinition[]>([])
  const [selected, setSelected] = useState<ToolDefinition | null>(null)
  const [args, setArgs] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ToolResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState<unknown>(null)

  useEffect(() => {
    api.get("/mcp/tools/").then((res) => {
      setTools(res.data.tools)
    }).catch(() => toast.error("Failed to load tools"))

    api.get("/mcp/context/").then((res) => {
      setContext(res.data.context)
    }).catch(() => {})
  }, [])

  const handleSelectTool = (tool: ToolDefinition) => {
    setSelected(tool)
    setResult(null)
    // Pre-fill defaults
    const defaults: Record<string, string> = {}
    Object.entries(tool.inputSchema.properties || {}).forEach(([key, schema]) => {
      if (schema.default !== undefined) {
        defaults[key] = String(schema.default)
      }
    })
    setArgs(defaults)
  }

  const handleCall = async () => {
    if (!selected) return
    setLoading(true)
    try {
      const parsedArgs: Record<string, unknown> = {}
      Object.entries(args).forEach(([key, val]) => {
        const schema = selected.inputSchema.properties[key]
        if (!val && val !== "0") return
        if (schema?.type === "integer") parsedArgs[key] = parseInt(val)
        else if (schema?.type === "boolean") parsedArgs[key] = val === "true"
        else parsedArgs[key] = val
      })

      const res = await api.post("/mcp/call/", {
        tool: selected.name,
        arguments: parsedArgs,
      })
      setResult(res.data)
    } catch {
      toast.error("Tool call failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Topbar
        title="MCP Tool Explorer"
        description="Test and explore DevOS MCP tools"
      />
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">

          {/* Tool list */}
          <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-sm font-medium text-white">
                Available tools
              </p>
              <span className="ml-auto text-xs text-zinc-600 font-mono">
                {tools.length}
              </span>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {tools.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => handleSelectTool(tool)}
                  className={`w-full text-left px-4 py-3 transition-colors
                    hover:bg-zinc-800/20 flex items-center gap-2
                    ${selected?.name === tool.name ? "bg-zinc-800/30" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-mono truncate">
                      {tool.name}
                    </p>
                    <p className="text-xs text-zinc-600 truncate mt-0.5">
                      {tool.description.slice(0, 60)}...
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Tool runner */}
          <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
            {!selected ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <Cpu className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-600 text-sm font-mono">
                    Select a tool to run
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="px-4 py-3 border-b border-zinc-800/60">
                  <p className="text-sm font-mono text-amber-400">
                    {selected.name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {selected.description}
                  </p>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-auto">
                  {Object.entries(selected.inputSchema.properties || {}).map(
                    ([key, schema]) => (
                      <div key={key}>
                        <label className="block text-xs text-zinc-500
                                         font-mono uppercase tracking-wider mb-1">
                          {key}
                          <span className="text-zinc-700 ml-1 normal-case">
                            ({schema.type})
                          </span>
                        </label>
                        {schema.enum ? (
                          <select
                            value={args[key] || ""}
                            onChange={(e) =>
                              setArgs((p) => ({ ...p, [key]: e.target.value }))
                            }
                            className="w-full bg-zinc-900 border border-zinc-800
                                       rounded-lg px-3 py-2 text-white text-sm
                                       focus:outline-none focus:border-amber-500/50">
                            <option value="">Any</option>
                            {schema.enum.map((v) => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={schema.type === "integer" ? "number" : "text"}
                            value={args[key] || ""}
                            onChange={(e) =>
                              setArgs((p) => ({ ...p, [key]: e.target.value }))
                            }
                            placeholder={String(schema.default ?? "")}
                            className="w-full bg-zinc-900 border border-zinc-800
                                       rounded-lg px-3 py-2 text-white text-sm
                                       focus:outline-none focus:border-amber-500/50"
                          />
                        )}
                        <p className="text-xs text-zinc-700 mt-0.5">
                          {schema.description}
                        </p>
                      </div>
                    )
                  )}

                  {Object.keys(selected.inputSchema.properties || {}).length === 0 && (
                    <p className="text-xs text-zinc-600 font-mono">
                      No arguments required
                    </p>
                  )}
                </div>

                <div className="p-4 border-t border-zinc-800/60">
                  <button
                    onClick={handleCall}
                    disabled={loading}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                               disabled:bg-amber-500/40 text-black text-sm font-medium
                               px-4 py-2 rounded-lg transition-colors w-full
                               justify-center">
                    <Play className="w-3.5 h-3.5" />
                    {loading ? "Running..." : "Run tool"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Result */}
          <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center gap-2">
              {result?.error ? (
                <XCircle className="w-3.5 h-3.5 text-red-400" />
              ) : result ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-zinc-700" />
              )}
              <p className="text-sm font-medium text-white">Result</p>
            </div>
            <div className="p-4 overflow-auto max-h-96 lg:max-h-full">
              {!result && !context && (
                <p className="text-zinc-600 text-xs font-mono">
                  Run a tool to see output
                </p>
              )}
              {result && (
                <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap">
                  {JSON.stringify(result.error || result.result, null, 2)}
                </pre>
              )}
              {!result && context && (
                <div>
                  <p className="text-xs text-zinc-600 font-mono mb-2">
                    Current context snapshot:
                  </p>
                  <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap">
                    {JSON.stringify(context, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
