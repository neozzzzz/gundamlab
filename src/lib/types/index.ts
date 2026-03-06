// src/lib/types/index.ts
// 애플리케이션에서 사용하는 타입 정의

import type { Database } from './database'

// 데이터베이스 테이블 타입 추출
export type Timeline = Database['public']['Tables']['timelines']['Row']
export type Series = Database['public']['Tables']['series']['Row']
export type Grade = Database['public']['Tables']['grades']['Row']
export type Brand = any
export type MobileSuit = Database['public']['Tables']['mobile_suits']['Row']
export type GundamKit = Database['public']['Tables']['gundam_kits']['Row']
export type KitImage = Database['public']['Tables']['kit_images']['Row']
export type KitRelation = Database['public']['Tables']['kit_relations']['Row']
export type PurchaseLink = Database['public']['Tables']['purchase_links']['Row']
export type Store = Database['public']['Tables']['stores']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Suggestion = Database['public']['Tables']['suggestions']['Row']
export type UserActivity = Database['public']['Tables']['user_activities']['Row']
export type LimitedType = Database['public']['Tables']['limited_types']['Row']

// 조인된 데이터 타입
export interface KitWithDetails {
  [key: string]: any
  grade: Grade | null
  brand: Brand | null
  series: Series | null
  mobile_suit: MobileSuit | null
  limited_type: LimitedType | null
  images: KitImage[]
  purchase_links: (PurchaseLink & { store: Store | null })[]
}

export interface KitListItem {
  [key: string]: any
  grade: Grade | null
  brand: Brand | null
  series: Series | null
  limited_type?: LimitedType | null
  images?: KitImage[]  // API에서 배열로 반환
  primary_image?: KitImage | null  // 하위 호환성 유지
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 필터 타입
export interface KitFilters {
  grade?: string[]
  brand?: string[]
  series?: string[]
  timeline?: string[]
  limitedTypes?: string[]
  priceMin?: number
  priceMax?: number
  isPbandai?: boolean
  search?: string
  sortBy?: 'release_date' | 'name_ko' | 'price_krw' | 'view_count'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// 제안 타입
export interface SuggestionCreate {
  kit_id?: string
  suggestion_type: 'edit' | 'new' | 'delete'
  current_data?: Record<string, any>
  suggested_data: Record<string, any>
  reason?: string
}

export interface SuggestionWithUser extends Suggestion {
  user: {
    display_name: string | null
    email: string
  } | null
}

// 사용자 역할
export type UserRole = 'admin' | 'moderator' | 'user'

// 인증 상태
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}
