import { getGitHubPinnedRepos, getGitHubStats } from "@/lib/github"
import { getProfile } from "@/lib/portfolio-api"
import { GitBranch, Star, GitFork, ExternalLink } from "lucide-react"
import { GitHubRepo } from "@/lib/github"

export async function GitHubSection() {
  const [profile, stats] = await Promise.all([
    getProfile(),
    getGitHubStats(),
  ])

  const hiddenRepos: string[] = (profile as unknown as { hidden_github_repos?: string[] })
    ?.hidden_github_repos ?? []

  const repos = await getGitHubPinnedRepos(hiddenRepos)

  if (!repos.length && !stats) return null

  return (
    <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
        Open source
      </p>
      <h2 className="text-2xl font-medium text-white mb-8">GitHub</h2>

      {stats && (
        <div className="flex items-center gap-6 mb-8 text-sm text-zinc-500">
          <span className="flex items-center gap-1.5">
            <GitBranch className="w-4 h-4" />
            {stats.public_repos} repos
          </span>
          <span>{stats.followers} followers</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {repos.map((repo: GitHubRepo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20
                       hover:border-zinc-700 hover:bg-zinc-900/40 transition-all duration-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <GitBranch className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                <p className="text-sm text-white font-medium truncate group-hover:text-amber-400 transition-colors">
                  {repo.name}
                </p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
            </div>

            {repo.description && (
              <p className="text-xs text-zinc-500 mb-3 line-clamp-2 leading-relaxed">
                {repo.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-xs text-zinc-600 font-mono">
              {repo.language && (
                <span className="text-zinc-500">{repo.language}</span>
              )}
              {repo.stargazers_count > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {repo.stargazers_count}
                </span>
              )}
              {repo.forks_count > 0 && (
                <span className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  {repo.forks_count}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
