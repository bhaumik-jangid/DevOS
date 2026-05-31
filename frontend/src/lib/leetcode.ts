export interface LeetCodeStats {
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  ranking: number
  acceptanceRate: number
  username: string
}

export async function getLeetCodeStats(username: string): Promise<LeetCodeStats | null> {
  if (!username) return null

  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          profile {
            ranking
          }
        }
        userContestRanking(username: $username) {
          rating
        }
      }
    `

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) return null
    const data = await res.json()
    const user = data?.data?.matchedUser
    if (!user) return null

    const stats = user.submitStats.acSubmissionNum
    const getCount = (diff: string) =>
      stats.find((s: { difficulty: string; count: number }) => s.difficulty === diff)?.count || 0

    return {
      username: user.username,
      totalSolved: getCount("All"),
      easySolved: getCount("Easy"),
      mediumSolved: getCount("Medium"),
      hardSolved: getCount("Hard"),
      ranking: user.profile?.ranking || 0,
      acceptanceRate: 0,
    }
  } catch {
    return null
  }
}
