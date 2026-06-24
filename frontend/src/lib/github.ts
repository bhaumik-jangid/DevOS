export interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  topics: string[]
  updated_at: string
  homepage: string | null
}

export interface GitHubStats {
  username: string
  public_repos: number
  followers: number
  following: number
  avatar_url: string
  bio: string | null
  name: string | null
}

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || ""
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ""

const headers: HeadersInit = GITHUB_TOKEN
  ? { Authorization: `Bearer ${GITHUB_TOKEN}` }
  : {}

export async function getGitHubPinnedRepos(): Promise<GitHubRepo[]> {
  if (!GITHUB_USERNAME) return []

  try {
    // GitHub's pinned repos require GraphQL
    const query = `
      query {
        user(login: "${GITHUB_USERNAME}") {
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                databaseId
                name
                description
                url
                stargazerCount
                forkCount
                primaryLanguage { name }
                repositoryTopics(first: 5) {
                  nodes { topic { name } }
                }
                updatedAt
                homepageUrl
              }
            }
          }
        }
      }
    `

    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`)

    const data = await res.json()
    const nodes = data?.data?.user?.pinnedItems?.nodes ?? []

    return nodes.map((n: {
      databaseId: number
      name: string
      description: string | null
      url: string
      stargazerCount: number
      forkCount: number
      primaryLanguage: { name: string } | null
      repositoryTopics: { nodes: { topic: { name: string } }[] }
      updatedAt: string
      homepageUrl: string | null
    }) => ({
      id: n.databaseId,
      name: n.name,
      description: n.description,
      html_url: n.url,
      stargazers_count: n.stargazerCount,
      forks_count: n.forkCount,
      language: n.primaryLanguage?.name ?? null,
      topics: n.repositoryTopics.nodes.map(
        (t: { topic: { name: string } }) => t.topic.name
      ),
      updated_at: n.updatedAt,
      homepage: n.homepageUrl,
    }))
  } catch {
    // Fall back to REST API — returns most recent public repos
    return getGitHubReposFallback()
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
    return repos.filter((r) => !r.forks_count).slice(0, 12)
  } catch {
    return []
  }
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

async function getGitHubReposFallback(): Promise<GitHubRepo[]> {
  if (!GITHUB_USERNAME) return []
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6&type=public`,
      { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const repos = await res.json()
    return repos
      .filter((r: GitHubRepo & { fork: boolean }) => !r.fork)
      .slice(0, 6)
  } catch {
    return []
  }
}

export async function getGitHubStats(): Promise<GitHubStats | null> {
  if (!GITHUB_USERNAME) return null
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}`,
      { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) return null

    const { login, ...rest } = await res.json()

    return {
      username: login,
      ...rest,
    }
  } catch {
    return null
  }
}
