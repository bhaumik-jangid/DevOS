import {
  Project, Skill, Experience, Certification,
  BlogPost, Profile, Academic, Achievement
} from "@/types/portfolio"

// Server-side: use internal URL to bypass proxy for performance
// Client-side: use NEXT_PUBLIC_API_URL (relative /api/v1 in production)
const API = typeof window === "undefined"
  ? process.env.INTERNAL_API_URL || "http://backend:8000/api/v1"
  : process.env.NEXT_PUBLIC_API_URL || "/api/v1"

async function fetcher<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 0 } })
    if (!res.ok) return (Array.isArray([]) ? [] : {}) as unknown as T
    const data = await res.json()
    if (data && typeof data === "object" && "results" in data) {
      return data.results as T
    }
    return data as T
  } catch {
    return (Array.isArray([]) ? [] : {}) as unknown as T
  }
}

export const getProfile = () => fetcher<Profile>("/portfolio/profile/")
export const getAcademic = () => fetcher<Academic[]>("/portfolio/academic/")
export const getAchievements = () => fetcher<Achievement[]>("/portfolio/achievements/")
export const getFeaturedProjects = () => fetcher<Project[]>("/projects/?featured=true")
export const getProjects = () => fetcher<Project[]>("/projects/")
export const getProject = (slug: string) => fetcher<Project>(`/projects/${slug}/`)
export const getSkills = () => fetcher<Skill[]>("/portfolio/skills/")
export const getExperience = () => fetcher<Experience[]>("/portfolio/experience/")
export const getCertifications = () => fetcher<Certification[]>("/portfolio/certifications/")
export const getBlogPosts = (params?: { tag?: string; category?: string; featured?: boolean }) => {
  const query = new URLSearchParams()
  if (params?.tag) query.set("tag", params.tag)
  if (params?.category) query.set("category", params.category)
  if (params?.featured) query.set("featured", "true")
  const qs = query.toString()
  return fetcher<BlogPost[]>(`/portfolio/blog/${qs ? "?" + qs : ""}`)
}
export const getBlogPost = (slug: string) => fetcher<BlogPost>(`/portfolio/blog/${slug}/`)
export const getSiteConfig = () => fetcher<Record<string, string>>("/portfolio/config/")
