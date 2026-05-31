const GITHUB_USERNAME = process.env.GITHUB_USERNAME || ""
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ""

const headers: Record<string, string> = {
  "Accept": "application/vnd.github.v3+json",
  ...(GITHUB_TOKEN ? { "Authorization": `Bearer ${GITHUB_TOKEN}` } : {}),
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
  topics: string[]
  fork: boolean
}

export interface GitHubStats {
  username: string
  public_repos: number
  followers: number
  following: number
  avatar_url: string
  bio: string
  company: string
  location: string
  blog: string
}

export async function getGitHubStats(): Promise<GitHubStats | null> {
  if (!GITHUB_USERNAME) return null
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}`,
      { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function getGitHubRepos(): Promise<GitHubRepo[]> {
  if (!GITHUB_USERNAME) return []
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20&type=owner`,
      { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const repos: GitHubRepo[] = await res.json()
    return repos.filter((r) => !r.fork).slice(0, 12)
    // return repos.filter((r) => !r.fork && r.stargazers_count > 0).slice(0, 6)
  } catch {
    return []
  }
}

export async function getContributionCount(): Promise<number> {
  // GitHub REST API doesn't expose contributions directly
  // Return 0 — will be replaced by the contribution graph component
  return 0
}

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Rust: "#dea584",
    Go: "#00ADD8",
    Java: "#b07219",
    "C++": "#f34b7d",
    CSS: "#563d7c",
    HTML: "#e34c26",
    Shell: "#89e051",
    Dockerfile: "#384d54",
  }
  return colors[language] || "#6e7681"
}
