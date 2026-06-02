export default function Loading() {
  return (
    <div className="min-h-screen bg-[#111113] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500
                        rounded-full animate-spin" />
        <p className="text-zinc-600 text-xs font-mono">Loading</p>
      </div>
    </div>
  )
}
