export interface Project {
  id: number
  name: string
  slug: string
  description: string
  stack_tags: string[]
  github_url: string
  live_url: string
  cover_image: string | null
  status: "active" | "maintenance" | "archived" | "in_progress"
  hosting_provider: string
  is_featured: boolean
  order: number
}

export interface Skill {
  id: number
  name: string
  category: string
  icon_name: string
  proficiency: number
  order: number
}

export interface Experience {
  id: number
  company: string
  role: string
  location: string
  description: string
  start_date: string
  end_date: string | null
  is_current: boolean
  order: number
}

export interface Certification {
  id: number
  name: string
  issuer: string
  issue_date: string
  expiry_date: string | null
  credential_url: string
  image: string | null
  order: number
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  cover_image: string | null
  tags: string[]
  published_at: string
  content?: string
}
