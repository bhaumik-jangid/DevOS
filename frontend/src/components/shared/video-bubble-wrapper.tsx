"use client"

import { useEffect, useState } from "react"
import { VideoBubble } from "@/components/public/video-bubble"

export function VideoBubbleWrapper() {
  const [videoUrl, setVideoUrl] = useState<string | undefined>()
  const [tooltips, setTooltips] = useState<string[]>([])

  useEffect(() => {
    const API = (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(/\/$/, "")
    const BACKEND = API.replace("/api/v1", "")

    fetch(`${API}/portfolio/profile/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        if (data.hero_video) {
          const url = String(data.hero_video).startsWith("http")
            ? data.hero_video
            : `${BACKEND}${data.hero_video}`
          setVideoUrl(url)
        }
        if (Array.isArray(data.video_tooltips) && data.video_tooltips.length > 0) {
          setTooltips(data.video_tooltips as string[])
        }
      })
      .catch(() => {})
  }, [])

  return <VideoBubble videoUrl={videoUrl} tooltips={tooltips} />
}
