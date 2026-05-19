import { Project, Skill, Experience, Certification, BlogPost } from "@/types/portfolio"

const API = typeof window === "undefined"
  ? process.env.INTERNAL_API_URL || "http://backend:8000/api/v1"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090/api/v1"

async function fetcher<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 0 } })
    if (!res.ok) return [] as unknown as T
    const data = await res.json()
    // DRF pagination wraps results — unwrap if paginated
    if (data && typeof data === "object" && "results" in data) {
      return data.results as T
    }
    return data as T
  } catch {
    return [] as unknown as T
  }
}

export const getFeaturedProjects = () => fetcher<Project[]>("/projects/?featured=true")
export const getProjects = () => fetcher<Project[]>("/projects/")
export const getProject = (slug: string) => fetcher<Project>(`/projects/${slug}/`)
export const getSkills = () => fetcher<Skill[]>("/portfolio/skills/")
export const getExperience = () => fetcher<Experience[]>("/portfolio/experience/")
export const getCertifications = () => fetcher<Certification[]>("/portfolio/certifications/")
export const getBlogPosts = () => fetcher<BlogPost[]>("/portfolio/blog/")
export const getBlogPost = (slug: string) => fetcher<BlogPost>(`/portfolio/blog/${slug}/`)
