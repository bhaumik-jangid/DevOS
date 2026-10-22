import { Profile, Project, Skill, Experience, Academic, Achievement, Certification, BlogPost } from "@/types/portfolio"

// Server-side: use INTERNAL_API_URL (direct to Render, bypasses CORS)
// Client-side: use NEXT_PUBLIC_API_URL (direct to Render in prod, nginx in dev)
function getApiBase(): string {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL || "http://backend:8000/api/v1"
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090/api/v1"
}

async function fetcher<T>(path: string): Promise<T> {
  const base = getApiBase().replace(/\/$/, "")
  const url = `${base}${path}`
  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return [] as unknown as T
    return res.json()
  } catch {
    return [] as unknown as T
  }
}

export const getProfile = () => fetcher<Profile>("/portfolio/profile/")
export const getSkills = () => fetcher<Skill[]>("/portfolio/skills/")
export const getExperience = () => fetcher<Experience[]>("/portfolio/experience/")
export const getAcademic = () => fetcher<Academic[]>("/portfolio/academic/")
export const getAchievements = () => fetcher<Achievement[]>("/portfolio/achievements/")
export const getCertifications = () => fetcher<Certification[]>("/portfolio/certifications/")
export const getBlogPost = (slug: string) => fetcher<BlogPost>(`/portfolio/blog/${slug}/`)
export const getProject = (slug: string) => fetcher<Project>(`/projects/${slug}/`)
export const getSiteConfig = () => fetcher<Record<string, string>>("/portfolio/config/")

export const getBlogPosts = (params?: { tag?: string; category?: string; featured?: boolean }) => {
  const query = new URLSearchParams()
  if (params?.tag) query.set("tag", params.tag)
  if (params?.category) query.set("category", params.category)
  if (params?.featured) query.set("featured", "true")
  const qs = query.toString()
  return fetcher<BlogPost[]>(`/portfolio/blog/${qs ? "?" + qs : ""}`)
}

export const getProjects = async (): Promise<Project[]> => {
  const data = await fetcher<Project[]>("/projects/")
  return data.filter((p: Project) => Boolean(p.slug))
}

export const getFeaturedProjects = async (): Promise<Project[]> => {
  const data = await fetcher<Project[]>("/projects/?featured=true")
  return data.filter((p: Project) => Boolean(p.slug))
}
