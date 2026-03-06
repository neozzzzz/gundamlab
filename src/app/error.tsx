'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-bold text-white">문제가 발생했습니다</h2>
      <p className="text-gray-400 text-sm">잠시 후 다시 시도해주세요.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}
