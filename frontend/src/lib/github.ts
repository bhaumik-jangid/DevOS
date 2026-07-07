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
  fork: boolean
}

export interface GitHubStats {
  public_repos: number
  followers: number
  following: number
  avatar_url: string
  bio: string | null
  name: string | null
}

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || process.env.NEXT_PUBLIC_GITHUB_USERNAME || ""
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ""

const headers: HeadersInit = GITHUB_TOKEN
  ? { Authorization: `Bearer ${GITHUB_TOKEN}` }
  : {}

export async function getGitHubPinnedRepos(hiddenRepos: string[] = []): Promise<GitHubRepo[]> {
  if (!GITHUB_USERNAME) return []
  const hidden = new Set(hiddenRepos.map((r) => r.toLowerCase()))

  try {
    // Try GraphQL for pinned repos first
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
                isFork
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

    if (res.ok) {
      const data = await res.json()
      const nodes = data?.data?.user?.pinnedItems?.nodes ?? []

      if (nodes.length > 0) {
        return nodes
          .filter((n: { name: string }) => !hidden.has(n.name.toLowerCase()))
          .map((n: {
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
            isFork: boolean
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
            fork: n.isFork,
          }))
      }
    }
  } catch {
    // Fall through to REST
  }

  return getGitHubReposFallback(hidden)
}

async function getGitHubReposFallback(hidden: Set<string>): Promise<GitHubRepo[]> {
  if (!GITHUB_USERNAME) return []
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20&type=public`,
      { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const repos: GitHubRepo[] = await res.json()
    return repos
      .filter((r) => !r.fork && !hidden.has(r.name.toLowerCase()))
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
    return res.json()
  } catch {
    return null
  }
}
