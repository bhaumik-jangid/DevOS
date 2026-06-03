export interface Profile {
  id: number
  name: string
  tagline: string
  bio: string
  email: string
  phone: string
  location: string
  github_url: string
  linkedin_url: string
  twitter_url: string
  resume: string | null
  photo_primary: string | null
  photo_secondary: string | null
  available_for_work: boolean
  years_of_experience: number
  leetcode_username: string
  leetcode_solved: number
  leetcode_easy: number
  leetcode_medium: number
  leetcode_hard: number
  codeforces_username: string
  codeforces_rating: number
  codechef_username: string
  total_dsa_solved: number
}

export interface Academic {
  id: number
  level: string
  institution: string
  board_or_university: string
  field_of_study: string
  percentage_or_cgpa: string
  scale: string
  start_year: number
  end_year: number | null
  is_current: boolean
  order: number
}

export interface Achievement {
  id: number
  title: string
  description: string
  date: string | null
  url: string
  icon_name: string
  order: number
}

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
  category: string
  published_at: string
  reading_time_minutes: number
  view_count: number
  featured: boolean
  content?: string
}
