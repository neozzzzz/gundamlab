// src/app/api/stats/route.ts
// 통계 API - 메인 페이지용

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    const [kitsResult, gradesResult, brandsResult, seriesResult] = await Promise.all([
      supabase.from('gundam_kits').select('*', { count: 'exact', head: true }).eq('status', 'active').is('deleted_at', null),
      supabase.from('grades').select('*', { count: 'exact', head: true }),
      supabase.from('brands').select('*', { count: 'exact', head: true }),
      supabase.from('series').select('*', { count: 'exact', head: true }),
    ])

    if (kitsResult.error) throw kitsResult.error

    const kits = kitsResult.count || 0
    const grades = gradesResult.count || 0
    const brands = brandsResult.count || 0
    const series = seriesResult.count || 0

    const response = NextResponse.json({
      data: { kits, grades, brands, series, gradesBrands: grades + brands }
    })
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
