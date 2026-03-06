// src/lib/admin/useAdminList.ts
// Admin 목록 페이지 공용 Hook
// V1.11.4: 로딩 상태 최적화 - 깜빡임 방지

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// ============================================
// 타입 정의
// ============================================

export interface UseAdminListConfig {
  tableName: string
  searchColumns?: string[]
  defaultOrderBy?: string
  defaultOrderAsc?: boolean
  pageSize?: number
  selectQuery?: string
  initialFilters?: Record<string, any>
  debounceMs?: number
}

export interface UseAdminListReturn<T> {
  items: T[]
  totalCount: number
  totalPages: number
  isLoading: boolean
  error: string | null
  searchTerm: string
  setSearchTerm: (term: string) => void
  filters: Record<string, any>
  setFilter: (key: string, value: any) => void
  clearFilters: () => void
  currentPage: number
  setCurrentPage: (page: number) => void
  pageSize: number
  reload: () => void
  deleteItem: (id: string, displayName?: string) => Promise<boolean>
}

// ============================================
// Hook 구현
// ============================================

export function useAdminList<T = any>(
  config: UseAdminListConfig
): UseAdminListReturn<T> {
  const {
    tableName,
    searchColumns = ['name_ko', 'name_en'],
    defaultOrderBy = 'updated_at',
    defaultOrderAsc = false,
    pageSize = 40,
    selectQuery = '*',
    initialFilters = {},
    debounceMs = 300,
  } = config

  // Supabase 클라이언트 (렌더링 간 유지)
  const supabaseRef = useRef(createClient())

  // 상태
  const [items, setItems] = useState<T[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 검색어 (입력값)
  const [searchTerm, setSearchTermState] = useState('')
  
  // 필터
  const [filtersState, setFiltersState] = useState<Record<string, any>>(initialFilters)
  
  // 페이지네이션
  const [currentPage, setCurrentPageState] = useState(1)

  // 리로드 트리거
  const [reloadTrigger, setReloadTrigger] = useState(0)

  // 마운트 상태
  const isMountedRef = useRef(true)

  // 디바운스된 검색어
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // 초기 로드 완료 여부 (첫 로드에만 로딩 표시)
  const initialLoadDoneRef = useRef(false)

  // 총 페이지 수
  const totalPages = Math.ceil(totalCount / pageSize)

  // ============================================
  // 검색어 디바운스
  // ============================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])

  // ============================================
  // 마운트/언마운트 처리
  // ============================================
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // ============================================
  // 데이터 로드 (메인 Effect)
  // ============================================
  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      if (!isMountedRef.current) return

      try {
        // 초기 로드 시에만 로딩 표시 (이후에는 백그라운드 로드)
        if (!initialLoadDoneRef.current) {
          setIsLoading(true)
        }
        setError(null)

        const supabase = supabaseRef.current
        const from = (currentPage - 1) * pageSize
        const to = from + pageSize - 1

        let query = supabase
          .from(tableName)
          .select(selectQuery, { count: 'exact' })

        // 디바운스된 검색어로 검색
        if (debouncedSearch && searchColumns.length > 0) {
          const conditions = searchColumns
            .map(col => `${col}.ilike.%${debouncedSearch}%`)
            .join(',')
          query = query.or(conditions)
        }

        // 필터 적용
        Object.entries(filtersState).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value) && value.length > 0) {
              query = query.in(key, value)
            } else if (!Array.isArray(value)) {
              query = query.eq(key, value)
            }
          }
        })

        // 정렬 + 페이지네이션
        query = query
          .order(defaultOrderBy, { ascending: defaultOrderAsc })
          .range(from, to)

        const { data, error: queryError, count } = await query

        // 취소되었거나 언마운트 되었으면 상태 업데이트 안함
        if (cancelled || !isMountedRef.current) return

        if (queryError) {
          throw new Error(queryError.message || '데이터 조회 실패')
        }

        // 상태 업데이트를 한 번에 처리 (배칭)
        const newItems = (data as T[]) || []
        const newCount = count || 0
        
        setItems(newItems)
        setTotalCount(newCount)
        initialLoadDoneRef.current = true

      } catch (err: any) {
        if (cancelled || !isMountedRef.current) return
        console.error(`[useAdminList] ${tableName} 로드 오류:`, err.message)
        setError(err.message || '데이터를 불러오는데 실패했습니다')
        setItems([])
        setTotalCount(0)
      } finally {
        if (!cancelled && isMountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [
    tableName,
    selectQuery,
    debouncedSearch,
    JSON.stringify(filtersState),
    JSON.stringify(searchColumns),
    currentPage,
    pageSize,
    defaultOrderBy,
    defaultOrderAsc,
    reloadTrigger,
  ])

  // ============================================
  // 검색어 변경 (페이지 리셋)
  // ============================================
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term)
    setCurrentPageState(1)
  }, [])

  // ============================================
  // 페이지 변경
  // ============================================
  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page)
  }, [])

  // ============================================
  // 필터 설정 (페이지 리셋)
  // ============================================
  const setFilter = useCallback((key: string, value: any) => {
    setFiltersState(prev => ({ ...prev, [key]: value }))
    setCurrentPageState(1)
  }, [])

  // ============================================
  // 필터 초기화
  // ============================================
  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters)
    setSearchTermState('')
    setCurrentPageState(1)
  }, [initialFilters])

  // ============================================
  // 새로고침 (트리거 증가)
  // ============================================
  const reload = useCallback(() => {
    setReloadTrigger(prev => prev + 1)
  }, [])

  // ============================================
  // 삭제
  // ============================================
  const deleteItem = useCallback(async (id: string, displayName?: string): Promise<boolean> => {
    const msg = displayName 
      ? `"${displayName}"을(를) 삭제하시겠습니까?`
      : '이 항목을 삭제하시겠습니까?'

    if (!confirm(msg)) return false

    try {
      const { error: deleteError } = await supabaseRef.current
        .from(tableName)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      alert('삭제되었습니다!')
      setReloadTrigger(prev => prev + 1)
      return true
    } catch (err: any) {
      console.error(`[useAdminList] ${tableName} 삭제 오류:`, err)
      alert(`삭제 실패: ${err.message}`)
      return false
    }
  }, [tableName])

  return {
    items,
    totalCount,
    totalPages,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filters: filtersState,
    setFilter,
    clearFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    reload,
    deleteItem,
  }
}

