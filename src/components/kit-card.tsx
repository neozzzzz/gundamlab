// src/components/kit-card.tsx
// 건담 킷 카드 컴포넌트 - Threads 스타일

'use client'

import Link from 'next/link'
import type { KitListItem } from '@/lib/types'

interface KitCardProps {
  kit: KitListItem
}

export function KitCard({ kit }: KitCardProps) {
  // kit_images 배열에서 첫 번째 이미지 가져오기
  const images = (kit as any).kit_images || kit.images
  const primaryImage = images && images.length > 0 
    ? images.find((img: any) => img.is_primary) || images[0]
    : null

  return (
    <Link href={`/kits/${kit.id}`}>
      <div className="card-threads group cursor-pointer">
        {/* 이미지 영역 */}
        <div className="relative aspect-[4/3] mb-4 bg-secondary rounded-xl overflow-hidden flex items-center justify-center">
          {(() => {
            // 1순위: box_art_url
            if (kit.box_art_url) {
              return (
                <img
                  src={kit.box_art_url}
                  alt={kit.name_ko || ""}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              )
            }
            // 2순위: kit_images
            if (primaryImage?.image_url) {
              return (
                <img
                  src={primaryImage.image_url}
                  alt={kit.name_ko || ""}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              )
            }
            // 없으면 기본 아이콘 (50% → 40%)
            return (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <img 
                  src="/no-image.png" 
                  alt="이미지 없음"
                  className="w-2/5 h-2/5 object-contain invert opacity-30"
                />
              </div>
            )
          })()}
          
          {/* 한정판 뱃지 - 동적 유형 */}
          {kit.limited_type && (
            <div 
              className="absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full font-bold"
              style={{ backgroundColor: (kit.limited_type as any).badge_color || '#DC2626' }}
            >
              {kit.limited_type.name_ko}
            </div>
          )}
          {/* 하위 호환성: limited_type이 없고 is_pbandai만 있는 경우 */}
          {!kit.limited_type && kit.is_pbandai && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              프리미엄 반다이
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="space-y-2">
          {/* 등급 & 스케일 & 브랜드 */}
          <div className="flex items-center gap-2 text-sm">
            {kit.grade && (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-semibold">
                  {(kit.grade as any).code}
                </span>
                {kit.grade.scale && (
                  <span className="px-2 py-1 bg-secondary text-foreground rounded-md font-medium text-xs">
                    {kit.grade.scale}
                  </span>
                )}
              </div>
            )}
            {kit.brand && (
              <span className="text-muted-foreground">
                {kit.brand.name}
              </span>
            )}
          </div>

          {/* 킷 이름 */}
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {kit.name_ko}
          </h3>

          {/* 시리즈 */}
          {kit.series && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {kit.series.name_ko}
            </p>
          )}

          {/* 가격 & 출시일 */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
            <div className="font-semibold">
              {kit.price_krw 
                ? `₩${kit.price_krw.toLocaleString()}` 
                : '가격 미정'
              }
            </div>
            {kit.release_date && (
              <div className="text-muted-foreground">
                {new Date(kit.release_date).toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'short' 
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
