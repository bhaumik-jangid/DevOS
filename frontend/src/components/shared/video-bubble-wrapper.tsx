"use client"

import { useEffect, useState } from "react"
import { VideoBubble } from "@/components/public/video-bubble"

export function VideoBubbleWrapper() {
  const [videoUrl, setVideoUrl] = useState<string | undefined>()
  const [tooltips, setTooltips] = useState<string[]>([])

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || "/api/v1"
    fetch(`${API}/portfolio/profile/`)
      .then((r) => r.json())
      .then((data) => {
        if (data.hero_video) {
          setVideoUrl(data.hero_video)
        }
        if (Array.isArray(data.video_tooltips) && data.video_tooltips.length > 0) {
          setTooltips(data.video_tooltips)
        }
      })
      .catch(() => {})
  }, [])

  return <VideoBubble videoUrl={videoUrl} tooltips={tooltips} />
}
