export function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-zinc-600 animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-[#111113] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500
                        rounded-full animate-spin" />
        <p className="text-zinc-600 text-xs font-mono">Loading</p>
      </div>
    </div>
  )
}

export function SkeletonLine({ width = "100%", height = "12px" }: {
  width?: string, height?: string
}) {
  return (
    <div
      className="bg-zinc-800/60 rounded animate-pulse"
      style={{ width, height }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="border border-zinc-800/60 rounded-xl p-5 space-y-3">
      <SkeletonLine width="40%" height="10px" />
      <SkeletonLine width="70%" height="14px" />
      <SkeletonLine width="90%" height="10px" />
      <SkeletonLine width="85%" height="10px" />
      <div className="flex gap-2 pt-1">
        <SkeletonLine width="48px" height="20px" />
        <SkeletonLine width="48px" height="20px" />
        <SkeletonLine width="48px" height="20px" />
      </div>
    </div>
  )
}
