'use client'

export default function KitsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-bold text-white">킷 목록을 불러올 수 없습니다</h2>
      <p className="text-gray-400 text-sm">네트워크 연결을 확인하고 다시 시도해주세요.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}
