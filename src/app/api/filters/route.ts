// src/app/api/filters/route.ts
// 필터 옵션 조회 API (등급, 브랜드, 시리즈, 한정판 유형 등)
// V1.9.1: 실제 DB 스키마에 맞게 수정

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. timelines - is_active 있음
    const { data: timelines, error: timelinesError } = await supabase
      .from('timelines')
      .select('id, name_ko, name_en, name_ja, description, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order')
    
    if (timelinesError) {
      console.error('Timelines fetch error:', timelinesError)
    }

    // 2. grades - code 컬럼 없음, id를 code처럼 사용, is_active 있음
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select('id, name_ko, name_en, name_ja, scale, difficulty, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order')
    
    if (gradesError) {
      console.error('Grades fetch error:', gradesError)
    }

    // grades 데이터에 code 필드 추가 (id를 code로 사용)
    const gradesWithCode = (grades || []).map(grade => ({
      ...grade,
      code: grade.id  // id를 code로 매핑
    }))

    // 3. brands - 제거됨 (z__brands로 백업됨)

    // 4. series - is_active 컬럼 없음!
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select(`
        id,
        name_ko,
        name_en,
        name_ja,
        year_start,
        year_end,
        media_type,
        timeline_id,
        timeline:timelines(id, name_ko)
      `)
      .order('year_start', { ascending: true, nullsFirst: false })
    
    if (seriesError) {
      console.error('Series fetch error:', seriesError)
    }

    // 5. limited_types - badge_color 컬럼 없음, is_active 있음
    const { data: limitedTypes, error: limitedTypesError } = await supabase
      .from('limited_types')
      .select('id, name_ko, name_en, name_ja, description, purchase_info, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order')
    
    if (limitedTypesError) {
      console.error('LimitedTypes fetch error:', limitedTypesError)
    }

    // limited_types에 기본 badge_color 추가
    const limitedTypesWithColor = (limitedTypes || []).map(lt => ({
      ...lt,
      badge_color: '#DC2626'  // 기본 빨간색
    }))

    const response = NextResponse.json({
      data: {
        timelines: timelines || [],
        grades: gradesWithCode,
        series: series || [],
        limitedTypes: limitedTypesWithColor,
      },
      error: null,
    })
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    console.error('Filter API error:', error)
    return NextResponse.json(
      { 
        data: {
          timelines: [],
          grades: [],
          series: [],
          limitedTypes: [],
        },
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
