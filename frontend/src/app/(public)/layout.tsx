import type { Metadata } from "next"
import { NavBar } from "@/components/public/navbar"
import { Footer } from "@/components/public/footer"
import { PageTracker } from "@/components/public/page-tracker"
import { VideoBubble } from "@/components/public/video-bubble"
import { getProfile, getSiteConfig } from "@/lib/portfolio-api"

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile()
  const name = profile?.name || "Developer"
  const tagline = profile?.tagline || "Full-stack Engineer"
  const bio = profile?.bio || "Full-stack engineer building production-grade systems."

  return {
    title: {
      default: `${name} - ${tagline}`,
      template: `%s | ${name}`,
    },
    description: bio.slice(0, 160),
    keywords: ["full-stack developer", "django", "next.js", "portfolio", name.toLowerCase()],
    authors: [{ name }],
    creator: name,
    openGraph: {
      type: "website",
      locale: "en_US",
      title: `${name} - ${tagline}`,
      description: bio.slice(0, 160),
      siteName: name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} - ${tagline}`,
      description: bio.slice(0, 160),
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  const config = await getSiteConfig()

  const BACKEND = process.env.INTERNAL_API_URL?.replace("/api/v1", "") || "http://backend:8000"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoUrl = (profile as any)?.hero_video
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? `${BACKEND}${(profile as any).hero_video}`
    : undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltips = (profile as any)?.video_tooltips?.length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (profile as any).video_tooltips
    : undefined

  return (
    <div className="min-h-screen bg-[#111113] text-white">
      <PageTracker />
      <NavBar />
      <main>{children}</main>
      <Footer config={config} />
      <VideoBubble videoUrl={videoUrl} tooltips={tooltips} />
    </div>
  )
}
