"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

const TOOLTIP_MESSAGES = [
  "Available for freelance work",
  "Open to full-time roles",
  "Let's build something great",
  "Full-stack engineer from India",
  "Django + Next.js specialist",
  "Always learning, always shipping",
  "Drop me a message below",
  "Coffee-driven development",
]

interface VideoBubbleProps {
  videoUrl?: string,
  tooltips?: string[],
}

export function VideoBubble({ videoUrl, tooltips }: VideoBubbleProps) {
  const [tooltip, setTooltip] = useState("")
  const [showTooltip, setShowTooltip] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (!videoUrl) return null

  const handleClick = () => {
    if(typeof tooltips === "undefined" || tooltips.length === 0) {
      setTooltip(TOOLTIP_MESSAGES[Math.floor(Math.random() * TOOLTIP_MESSAGES.length)])
    } else {
      setTooltip(tooltips[Math.floor(Math.random() * tooltips.length)])
    }
    setShowTooltip(true)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setShowTooltip(false), 3500)
  }



  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-700/60
                       rounded-xl px-3 py-2 shadow-xl max-w-48">
            <p className="text-xs text-zinc-300 leading-snug">{tooltip}</p>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video circle */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full overflow-hidden
                   border-2 border-amber-500/40 hover:border-amber-500/70
                   shadow-lg shadow-black/40 transition-all duration-200
                   cursor-pointer">
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Subtle ring animation */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/20
                        animate-ping" />
      </motion.button>
    </div>
  )
}
