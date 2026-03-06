// src/app/page.tsx
// 메인 페이지 - 건담 킷 목록

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'

interface Stats {
  kits: number
  grades: number
  brands: number
  series: number
  gradesBrands: number
}

export default function HomePage() {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState<Stats>({
    kits: 0,
    grades: 0,
    brands: 0,
    series: 0,
    gradesBrands: 0
  })
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch('/api/stats')
      const result = await response.json()
      if (result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}


      {/* 히어로 섹션 */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center space-y-6 animate-fade-in">
          <h2 className="text-5xl font-bold">
            건담과 프라모델
            <br />
            <span className="text-gradient">모든 정보를 한곳에</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            HG, MG, RG, PG부터 SD까지
            <br />
            건담 모델의 모든 것을 탐색하고 공유하세요
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <Link href="/kits" className="btn-primary text-lg px-8 py-3">
              모델 탐색하기
            </Link>
            <button 
              onClick={() => setShowModal(true)} 
              className="btn-secondary text-lg px-8 py-3"
            >
              자세히 보기
            </button>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-threads text-center p-8 min-h-[120px]">
            <div className="text-4xl font-bold text-gradient mb-2 h-10 flex items-center justify-center">
              {stats.kits.toLocaleString()}
            </div>
            <div className="text-muted-foreground">건담 모델</div>
          </div>
          <div className="card-threads text-center p-8 min-h-[120px]">
            <div className="text-4xl font-bold text-gradient mb-2 h-10 flex items-center justify-center">
              {stats.gradesBrands.toLocaleString()}
            </div>
            <div className="text-muted-foreground">등급 & 브랜드</div>
          </div>
          <div className="card-threads text-center p-8 min-h-[120px]">
            <div className="text-4xl font-bold text-gradient mb-2 h-10 flex items-center justify-center">
              {stats.series.toLocaleString()}
            </div>
            <div className="text-muted-foreground">시리즈</div>
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">주요 기능</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card-threads p-6 space-y-3">
            <div className="w-10 h-10">
              <img src="/icons/search.svg" alt="검색" className="w-full h-full" />
            </div>
            <h4 className="text-xl font-semibold">강력한 검색</h4>
            <p className="text-muted-foreground">
              등급, 시리즈, 가격대별로 원하는 모델을 빠르게 찾으세요
            </p>
          </div>
          <div className="card-threads p-6 space-y-3">
            <div className="w-10 h-10">
              <img src="/icons/link.svg" alt="링크" className="w-full h-full" />
            </div>
            <h4 className="text-xl font-semibold">구매 링크</h4>
            <p className="text-muted-foreground">
              반다이몰, 아마존 등 다양한 판매처 링크를 한번에
            </p>
          </div>
          <div className="card-threads p-6 space-y-3">
            <div className="w-10 h-10">
              <img src="/icons/users.svg" alt="집단지성" className="w-full h-full" />
            </div>
            <h4 className="text-xl font-semibold">집단지성</h4>
            <p className="text-muted-foreground">
              커뮤니티와 함께 정보를 업데이트하고 공유하세요
            </p>
          </div>
          <div className="card-threads p-6 space-y-3">
            <div className="w-10 h-10">
              <img src="/icons/chart.svg" alt="상세정보" className="w-full h-full" />
            </div>
            <h4 className="text-xl font-semibold">상세 정보</h4>
            <p className="text-muted-foreground">
              가격, 출시일, 스케일, 런너 수 등 모든 정보 제공
            </p>
          </div>
          <div className="card-threads p-6 space-y-3">
            <div className="w-10 h-10">
              <img src="/icons/image.svg" alt="이미지" className="w-full h-full" />
            </div>
            <h4 className="text-xl font-semibold">고품질 이미지</h4>
            <p className="text-muted-foreground">
              박스아트, 완성품 사진, 런너 이미지까지
            </p>
          </div>
          <div className="card-threads p-6 space-y-3">
            <div className="w-10 h-10">
              <img src="/icons/bell.svg" alt="알림" className="w-full h-full" />
            </div>
            <h4 className="text-xl font-semibold">신제품 알림</h4>
            <p className="text-muted-foreground">
              최신 출시작과 P-BANDAI 한정판 정보를 놓치지 마세요
            </p>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>© 2026 GUNDAM ARCHIVE. Made with ❤️ for Gunpla fans.</p>
            <p className="text-sm mt-2">
              이 사이트는 비공식 팬 프로젝트입니다. 모든 건담 관련 저작권은 BANDAI NAMCO에 있습니다.
            </p>
            {isAdmin && (
              <a href="/admin" className="inline-block mt-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                관리자
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* 관리자 대시보드 링크 */}
      {isAdmin && (
        <div className="bg-zinc-900 border-t border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-zinc-500">관리자</span>
              <Link 
                href="/admin" 
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                대시보드 →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 준비중 모달 */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-card border border-border rounded-2xl p-8 max-w-sm mx-4 text-center animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-4">🚧</div>
            <h3 className="text-xl font-bold mb-2">준비중입니다</h3>
            <p className="text-muted-foreground mb-6">
              해당 기능은 현재 개발 중입니다.<br />
              조금만 기다려주세요!
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="btn-primary px-6 py-2"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
