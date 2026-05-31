import { GitBranch, Star, GitFork, ExternalLink } from "lucide-react"
import { getGitHubStats, getGitHubRepos, getLanguageColor } from "@/lib/github"

export async function GitHubSection() {
  const [stats, repos] = await Promise.all([
    getGitHubStats(),
    getGitHubRepos(),
  ])

  if (!stats && !repos.length) return null

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
        Open source
      </p>
      <h2 className="text-2xl font-medium text-white mb-2">GitHub activity</h2>

      {stats && (
        <div className="flex items-center gap-6 mb-8 flex-wrap">
          <a href={`https://github.com/${stats.username}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-400 hover:text-white
                       text-sm transition-colors">
            <GitBranch className="w-4 h-4 text-amber-500" />
            @{stats.username}
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-zinc-600 text-sm font-mono">
            {stats.public_repos} repos
          </span>
          <span className="text-zinc-600 text-sm font-mono">
            {stats.followers} followers
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {repos.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20
                       hover:border-zinc-700 hover:bg-zinc-900/40 transition-all duration-200">

            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white text-sm font-medium group-hover:text-amber-400
                             transition-colors truncate flex-1 mr-2">
                {repo.name}
              </h3>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-600
                                       group-hover:text-zinc-400 transition-colors shrink-0" />
            </div>

            {repo.description && (
              <p className="text-zinc-500 text-xs leading-relaxed mb-3 line-clamp-2">
                {repo.description}
              </p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              {repo.language && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getLanguageColor(repo.language) }}
                  />
                  <span className="text-xs text-zinc-500 font-mono">
                    {repo.language}
                  </span>
                </div>
              )}
              {repo.stargazers_count > 0 && (
                <div className="flex items-center gap-1 text-zinc-600">
                  <Star className="w-3 h-3" />
                  <span className="text-xs font-mono">{repo.stargazers_count}</span>
                </div>
              )}
              {repo.forks_count > 0 && (
                <div className="flex items-center gap-1 text-zinc-600">
                  <GitFork className="w-3 h-3" />
                  <span className="text-xs font-mono">{repo.forks_count}</span>
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
