"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

const DEFAULT_TOOLTIPS = [
  "Building something cool",
  "Available for freelance work",
  "Open to new opportunities",
  "Full-stack engineer at work",
  "Check out my projects below",
  "Say hello",
]

interface VideoBubbleProps {
  videoUrl?: string
  tooltips?: string[]
}

export function VideoBubble({ videoUrl, tooltips = DEFAULT_TOOLTIPS }: VideoBubbleProps) {
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    }
  }, [])

  const handleClick = () => {
    if (expanded) {
      setExpanded(false)
      return
    }
    const random = tooltips[Math.floor(Math.random() * tooltips.length)]
    setTooltip(random)
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    tooltipTimer.current = setTimeout(() => setTooltip(null), 3500)
  }

  if (!videoUrl) return null
  console.log("Rendering VideoBubble with videoUrl:", videoUrl, "and tooltips:", tooltips)
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-48 px-3 py-2 bg-zinc-900 border border-zinc-700
                       rounded-xl text-xs text-zinc-300 text-right shadow-lg shadow-black/40">
            {tooltip}
            <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-zinc-900
                            border-r border-b border-zinc-700 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded player */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-56 sm:w-72 aspect-video rounded-2xl overflow-hidden
                       border border-zinc-700 shadow-2xl shadow-black/60 bg-black">
            <video src={videoUrl} autoPlay loop muted playsInline
              className="w-full h-full object-cover" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full overflow-hidden
                   border-2 border-amber-500/40 hover:border-amber-500/80
                   shadow-lg shadow-black/40 transition-all duration-200
                   cursor-pointer group">
        <video ref={videoRef} src={videoUrl} autoPlay loop muted playsInline
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                        transition-opacity flex items-center justify-center">
          {expanded
            ? <X className="w-5 h-5 text-white" />
            : <div className="w-0 h-0 border-t-4 border-t-transparent
                              border-b-4 border-b-transparent
                              border-l-8 border-l-white ml-0.5" />
          }
        </div>
        <div className="absolute -inset-1 rounded-full border border-amber-500/20
                        animate-ping pointer-events-none" />
      </motion.button>
    </div>
  )
}
