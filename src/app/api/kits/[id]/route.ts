// src/app/api/kits/[id]/route.ts
// 리팩토링: 쿼리 병렬화 (Promise.all)
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Step 1: 킷 기본 정보 (필수)
    const { data: kitOnly, error: kitError } = await supabase
      .from('gundam_kits')
      .select('*')
      .eq('id', id)
      .single()

    if (kitError || !kitOnly) {
      return NextResponse.json(
        { error: 'Kit not found' },
        { status: 404 }
      )
    }

    // Step 2: 독립 쿼리들을 병렬 실행
    const [
      gradeResult,
      seriesResult,
      limitedTypeResult,
      imagesResult,
      relationsResult,
      sameMsResult,
      mobileSuitResult,
    ] = await Promise.all([
      // grade
      kitOnly.grade_id
        ? supabase.from('grades').select('*').eq('id', kitOnly.grade_id).single()
        : Promise.resolve({ data: null }),
      // series
      kitOnly.series_id
        ? supabase.from('series').select('*').eq('id', kitOnly.series_id).single()
        : Promise.resolve({ data: null }),
      // limited_type
      kitOnly.limited_type_id
        ? supabase.from('limited_types').select('*').eq('id', kitOnly.limited_type_id).single()
        : Promise.resolve({ data: null }),
      // images
      supabase.from('kit_images').select('*').eq('kit_id', id).order('is_primary', { ascending: false }),
      // relations
      supabase.from('kit_relations').select('related_kit_id, relation_type').eq('kit_id', id),
      // same mobile suit kits
      kitOnly.mobile_suit_id
        ? supabase.from('gundam_kits')
            .select('id, name_ko, name_en, box_art_url, price_krw, grade_id, series:series(name_ko)')
            .eq('mobile_suit_id', kitOnly.mobile_suit_id)
            .neq('id', id)
            .is('deleted_at', null)
            .order('release_date', { ascending: false })
            .limit(10)
        : Promise.resolve({ data: null }),
      // mobile_suit
      kitOnly.mobile_suit_id
        ? supabase.from('mobile_suits').select('*').eq('id', kitOnly.mobile_suit_id).single()
        : Promise.resolve({ data: null }),
    ])

    // Step 3: mobile_suit 연관 데이터 (종속 쿼리 - 병렬화)
    let mobileSuitData = null
    const mobileSuit = mobileSuitResult.data
    if (mobileSuit) {
      const [msPilotResult, msOrgsResult] = await Promise.all([
        supabase.from('mobile_suit_pilots')
          .select('pilot_id, is_primary')
          .eq('ms_id', mobileSuit.id)
          .eq('is_primary', true)
          .single(),
        supabase.from('ms_organizations')
          .select('relationship_type, organization:organizations(id, code, name_ko, name_en, org_type, color)')
          .eq('mobile_suit_id', mobileSuit.id),
      ])

      // 파일럿 (종속)
      let pilotData = null
      if (msPilotResult.data?.pilot_id) {
        const { data: pilot } = await supabase
          .from('pilots').select('*').eq('id', msPilotResult.data.pilot_id).single()
        pilotData = pilot
      }

      // 조직
      let manufacturerData: any = null
      let operatorData: any = null
      const msOrgs = msOrgsResult.data
      if (msOrgs && msOrgs.length > 0) {
        const mfRel = msOrgs.find((r: any) => r.relationship_type === 'manufactured_by')
        if (mfRel?.organization) manufacturerData = mfRel.organization
        const opRel = msOrgs.find((r: any) => r.relationship_type === 'operated_by')
        if (opRel?.organization) operatorData = opRel.organization
      }

      // 진영 (운용 조직 종속)
      let factionData: any = null
      if (operatorData) {
        const { data: fm } = await supabase
          .from('org_faction_memberships')
          .select('faction:factions(id, code, name_ko, name_en, color)')
          .eq('organization_id', operatorData.id)
          .eq('is_primary', true)
          .single()
        if (fm?.faction) factionData = fm.faction
      }

      mobileSuitData = {
        ...mobileSuit,
        pilot: pilotData,
        factions: factionData,
        company: manufacturerData,
        manufacturer: manufacturerData,
        operator: operatorData,
      }
    }

    // Step 4: 관련 킷 처리
    let relatedKitsData: any[] = []
    const relations = relationsResult.data
    if (relations && relations.length > 0) {
      const relatedKitIds = relations.map((r: any) => r.related_kit_id)
      const { data: relatedKits } = await supabase
        .from('gundam_kits')
        .select('id, name_ko, name_en, box_art_url, price_krw, grade:grades(code, scale), series:series(name_ko)')
        .in('id', relatedKitIds)
        .is('deleted_at', null)
      
      if (relatedKits) {
        relatedKitsData = relatedKits.map((kit: any) => {
          const relation = relations.find((r: any) => r.related_kit_id === kit.id)
          return { ...kit, relation_type: relation?.relation_type }
        })
      }
    }

    // same MS kits
    let sameMsKitsData: any[] = []
    if (sameMsResult.data && sameMsResult.data.length > 0) {
      sameMsKitsData = sameMsResult.data.map((kit: any) => ({
        ...kit,
        relation_type: 'same_mobile_suit',
        grade: { code: kit.grade_id },
      }))
    }

    // 합치기 (중복 제거)
    const existingIds = new Set(relatedKitsData.map((k: any) => k.id))
    const uniqueSameMsKits = sameMsKitsData.filter((k: any) => !existingIds.has(k.id))
    const combinedRelatedKits = [...relatedKitsData, ...uniqueSameMsKits]

    return NextResponse.json({
      ...kitOnly,
      grades: gradeResult.data,
      series: seriesResult.data,
      brand: null,
      mobile_suits: mobileSuitData,
      limited_type: limitedTypeResult.data,
      kit_images: imagesResult.data || [],
      related_kits: combinedRelatedKits,
    })
    
  } catch (error) {
    console.error('Kit detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
