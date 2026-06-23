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
    return res.json()
  } catch {
    return null
  }
}
