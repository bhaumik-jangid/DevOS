"use client"

import { Component, ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error("Dashboard error:", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20
                            flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-white font-medium mb-2">Something went wrong</h2>
            <p className="text-zinc-500 text-sm mb-6 font-mono">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         border border-zinc-800 text-zinc-400 hover:text-white
                         text-sm transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
