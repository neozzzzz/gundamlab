// src/app/api/kits/[id]/v2/route.ts
// V2 테스트: 같은 모빌슈트의 킷들을 연관 킷으로 포함
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Step 1: 먼저 킷만 가져오기 (JOIN 없이)
    const { data: kitOnly, error: kitError } = await supabase
      .from('gundam_kits')
      .select('*')
      .eq('id', id)
      .single()

    if (kitError) {
      console.error('Kit fetch error:', kitError)
      return NextResponse.json(
        { error: 'Kit not found' },
        { status: 404 }
      )
    }

    if (!kitOnly) {
      return NextResponse.json(
        { error: 'Kit not found' },
        { status: 404 }
      )
    }

    // Step 2: grade 정보 가져오기
    let gradeData = null
    if (kitOnly.grade_id) {
      const { data: grade } = await supabase
        .from('grades')
        .select('*')
        .eq('id', kitOnly.grade_id)
        .single()
      gradeData = grade
    }

    // Step 3: series 정보 가져오기
    let seriesData = null
    if (kitOnly.series_id) {
      const { data: series } = await supabase
        .from('series')
        .select('*')
        .eq('id', kitOnly.series_id)
        .single()
      seriesData = series
    }

    // Step 4: brand 정보 가져오기
    let brandData = null
    if (kitOnly.brand_id) {
      const { data: brand } = await supabase
        .from('brands')
        .select('*')
        .eq('id', kitOnly.brand_id)
        .single()
      brandData = brand
    }

    // Step 5: mobile_suit 정보 가져오기
    let mobileSuitData = null
    if (kitOnly.mobile_suit_id) {
      const { data: mobileSuit } = await supabase
        .from('mobile_suits')
        .select('*')
        .eq('id', kitOnly.mobile_suit_id)
        .single()
      
      if (mobileSuit) {
        // V1.9: mobile_suit_pilots 테이블을 통해 파일럿 정보 가져오기
        let pilotData = null
        const { data: msPilotRelation } = await supabase
          .from('mobile_suit_pilots')
          .select('pilot_id, is_primary')
          .eq('ms_id', mobileSuit.id)
          .eq('is_primary', true)
          .single()
        
        if (msPilotRelation?.pilot_id) {
          const { data: pilot } = await supabase
            .from('pilots')
            .select('*')
            .eq('id', msPilotRelation.pilot_id)
            .single()
          pilotData = pilot
        }

        // V1.9: ms_organizations 테이블을 통해 제조사/운용 조직 정보 가져오기
        let manufacturerData: any = null
        let operatorData: any = null
        
        const { data: msOrgs } = await supabase
          .from('ms_organizations')
          .select(`
            relationship_type,
            organization:organizations(id, code, name_ko, name_en, org_type, color)
          `)
          .eq('mobile_suit_id', mobileSuit.id)
        
        if (msOrgs && msOrgs.length > 0) {
          const manufacturerRel = msOrgs.find(rel => rel.relationship_type === 'manufactured_by')
          if (manufacturerRel?.organization) {
            manufacturerData = manufacturerRel.organization
          }
          
          const operatorRel = msOrgs.find(rel => rel.relationship_type === 'operated_by')
          if (operatorRel?.organization) {
            operatorData = operatorRel.organization
          }
        }

        // V1.9: org_faction_memberships를 통해 진영 정보 가져오기
        let factionData: any = null
        if (operatorData) {
          const { data: factionMembership } = await supabase
            .from('org_faction_memberships')
            .select(`
              faction:factions(id, code, name_ko, name_en, color)
            `)
            .eq('organization_id', operatorData.id)
            .eq('is_primary', true)
            .single()
          
          if (factionMembership?.faction) {
            factionData = factionMembership.faction
          }
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
    }

    // Step 6: limited_type 정보 가져오기
    let limitedTypeData = null
    if (kitOnly.limited_type_id) {
      const { data: limitedType } = await supabase
        .from('limited_types')
        .select('*')
        .eq('id', kitOnly.limited_type_id)
        .single()
      limitedTypeData = limitedType
    }

    // Step 7: kit_images 가져오기
    let imagesData: any[] = []
    const { data: images } = await supabase
      .from('kit_images')
      .select('*')
      .eq('kit_id', id)
      .order('is_primary', { ascending: false })
    
    if (images) {
      imagesData = images
    }

    // Step 8: 관련 킷 가져오기 (기존 kit_relations 테이블)
    let relatedKitsData: any[] = []
    const { data: relations } = await supabase
      .from('kit_relations')
      .select('related_kit_id, relation_type')
      .eq('kit_id', id)
    
    if (relations && relations.length > 0) {
      const relatedKitIds = relations.map(r => r.related_kit_id)
      const { data: relatedKits } = await supabase
        .from('gundam_kits')
        .select(`
          id, name_ko, name_en, box_art_url, price_krw,
          grade:grades(code, scale),
          series:series(name_ko)
        `)
        .in('id', relatedKitIds)
        .is('deleted_at', null)
      
      if (relatedKits) {
        relatedKitsData = relatedKits.map(kit => {
          const relation = relations.find(r => r.related_kit_id === kit.id)
          return {
            ...kit,
            relation_type: relation?.relation_type
          }
        })
      }
    }

    // ==========================================
    // V2 추가: 같은 모빌슈트의 다른 킷들 가져오기
    // ==========================================
    let sameMsKitsData: any[] = []
    
    if (kitOnly.mobile_suit_id) {
      const { data: sameMsKits, error: sameMsError } = await supabase
        .from('gundam_kits')
        .select(`
          id, name_ko, name_en, box_art_url, price_krw, grade_id,
          series:series(name_ko)
        `)
        .eq('mobile_suit_id', kitOnly.mobile_suit_id)
        .neq('id', id)
        .is('deleted_at', null)
        .order('release_date', { ascending: false })
        .limit(10)

      if (sameMsError) {
        console.error('Same mobile suit kits query error:', sameMsError)
      }
      
      if (sameMsKits && sameMsKits.length > 0) {
        sameMsKitsData = sameMsKits.map(kit => ({
          ...kit,
          relation_type: 'same_mobile_suit',
          grade: { code: kit.grade_id }  // grade_id를 grade.code로 매핑
        }))
      }
    }

    // 관련 킷 합치기 (기존 + 같은 MS)
    // 중복 제거
    const existingIds = new Set(relatedKitsData.map(k => k.id))
    const uniqueSameMsKits = sameMsKitsData.filter(k => !existingIds.has(k.id))
    const combinedRelatedKits = [...relatedKitsData, ...uniqueSameMsKits]
    
    // 최종 결과 조합
    const result = {
      ...kitOnly,
      grades: gradeData,
      series: seriesData,
      brand: brandData,
      mobile_suits: mobileSuitData,
      limited_type: limitedTypeData,
      kit_images: imagesData,
      related_kits: combinedRelatedKits,
      same_ms_kits: sameMsKitsData
    }

    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Kit detail API v2 error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
