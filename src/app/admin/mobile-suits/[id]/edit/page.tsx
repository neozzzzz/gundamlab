'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import ImageUpload from '@/components/image-upload'
import { ADMIN_PAGES, ADMIN_STYLES, ORG_TYPES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminTextField, AdminTextarea, AdminSelectButtons, AdminFormSection, AdminSubmitButtons, AdminLoading } from '@/components/admin'
import AdminAutocomplete from '@/components/admin/AdminAutocomplete'

const PAGE_CONFIG = ADMIN_PAGES.mobileSuits

// 파일럿 타입 정의 (V1.10: code 제거)
interface Pilot {
  id: string
  name_ko: string
  name_en?: string
}

export default function EditMobileSuit() {
  const router = useRouter()
  const params = useParams()
  const msId = params?.id as string
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [series, setSeries] = useState<any[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  
  // 파일럿 선택 (자동완성용)
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(null)
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    name_ja: '',
    model_number: '',
    series_id: '',
    description: '',
    image_url: '',
  })
  
  // 관계 테이블용 상태
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('')
  const [selectedOperator, setSelectedOperator] = useState<string>('')

  useEffect(() => {
    const init = async () => {
      await loadData()
      if (msId) await loadMobileSuit()
    }
    init()
  }, [msId])


  const loadData = async () => {
    try {
      const [seriesRes, orgsRes] = await Promise.all([
        supabase.from('series').select('id, name_ko').order('name_ko'),
        supabase.from('organizations').select('id, name_ko, org_type, color').eq('is_active', true).order('sort_order'),
      ])
      setSeries(seriesRes.data || [])
      setOrganizations(orgsRes.data || [])
    } catch (error) {
      console.error('데이터 로딩 오류:', error)
    }
  }

  const loadMobileSuit = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.from('mobile_suits').select('*').eq('id', msId).single()
      if (error) throw error

      if (data) {
        setFormData({
          name_ko: data.name_ko || '',
          name_en: data.name_en || '',
          name_ja: data.name_ja || '',
          model_number: data.model_number || '',
          series_id: data.series_id || '',
          description: data.description || '',
          image_url: data.image_url || '',
        })
      }
      
      // ms_organizations에서 관계 정보 가져오기
      const { data: msOrgs } = await supabase
        .from('ms_organizations')
        .select('organization_id, relationship_type')
        .eq('mobile_suit_id', msId)
      
      if (msOrgs) {
        const manufacturer = msOrgs.find(r => r.relationship_type === 'manufactured_by')
        const operator = msOrgs.find(r => r.relationship_type === 'operated_by')
        if (manufacturer) setSelectedManufacturer(manufacturer.organization_id)
        if (operator) setSelectedOperator(operator.organization_id)
      }
      
      // mobile_suit_pilots에서 파일럿 정보 가져오기
      const { data: msPilots } = await supabase
        .from('mobile_suit_pilots')
        .select('pilot_id')
        .eq('ms_id', msId)
        .eq('is_primary', true)
        .single()
      
      if (msPilots?.pilot_id) {
        const { data: pilotData } = await supabase
          .from('pilots')
          .select('id, name_ko, name_en')
          .eq('id', msPilots.pilot_id)
          .single()
        
        if (pilotData) {
          setSelectedPilot(pilotData)
        }
      }
      
    } catch (error: any) {
      alert(`로딩 실패: ${error.message}`)
      router.push(PAGE_CONFIG.basePath)
    } finally {
      setLoading(false)
    }
  }

  // 파일럿 검색 함수 (useCallback으로 메모이제이션)
  const searchPilots = useCallback(async (query: string): Promise<Pilot[]> => {
    const { data } = await supabase
      .from('pilots')
      .select('id, name_ko, name_en')
      .or(`name_ko.ilike.%${query}%,name_en.ilike.%${query}%,id.ilike.%${query}%`)
      .limit(10)
    return data || []
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name_ko.trim()) {
      alert(`${PAGE_CONFIG.titleSingle} 이름(한글)은 필수입니다.`)
      return
    }

    try {
      setSaving(true)
      
      const { error } = await supabase.from('mobile_suits').update({
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        name_ja: formData.name_ja?.trim() || null,
        model_number: formData.model_number?.trim().toUpperCase() || null,
        series_id: formData.series_id || null,
        description: formData.description?.trim() || null,
        image_url: formData.image_url || null,
        updated_at: new Date().toISOString(),
      }).eq('id', msId).select()

      if (error) throw error
      
      // ms_organizations 관계 업데이트
      await supabase.from('ms_organizations').delete().eq('mobile_suit_id', msId)
      
      const msOrgInserts = []
      if (selectedManufacturer) {
        msOrgInserts.push({
          mobile_suit_id: msId,
          organization_id: selectedManufacturer,
          relationship_type: 'manufactured_by',
          is_primary: true,
        })
      }
      if (selectedOperator) {
        msOrgInserts.push({
          mobile_suit_id: msId,
          organization_id: selectedOperator,
          relationship_type: 'operated_by',
          is_primary: true,
        })
      }
      
      if (msOrgInserts.length > 0) {
        await supabase.from('ms_organizations').insert(msOrgInserts)
      }
      
      // mobile_suit_pilots 관계 업데이트
      await supabase.from('mobile_suit_pilots').delete().eq('ms_id', msId)
      
      if (selectedPilot) {
        await supabase.from('mobile_suit_pilots').insert({
          ms_id: msId,
          pilot_id: selectedPilot.id,
          is_primary: true,
        })
      }

      alert(`${PAGE_CONFIG.titleSingle}가 성공적으로 수정되었습니다!`)
      router.push(PAGE_CONFIG.basePath)
    } catch (error: any) {
      alert(`수정 실패: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // 조직 정렬
  const sortOrganizations = (preferType: string) => {
    return [...organizations].sort((a, b) => {
      if (a.org_type === preferType && b.org_type !== preferType) return -1
      if (a.org_type !== preferType && b.org_type === preferType) return 1
      return 0
    })
  }
  
  const manufacturerOptions = sortOrganizations('CORPORATE')
  const operatorOptions = sortOrganizations('MILITARY')
  const getOrgTypeLabel = (type: string) => ORG_TYPES.find(t => t.code === type)?.name || type

  if (loading) {
    return <AdminLoading message={`${PAGE_CONFIG.titleSingle} 정보를 불러오는 중...`} spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title={`${PAGE_CONFIG.titleSingle} 수정`} icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          <AdminFormSection title="이미지">
            <div className="max-w-xs">
              <ImageUpload value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} bucket="images" folder="mobile-suits" aspectRatio="aspect-square" placeholder="모빌슈트 이미지" />
            </div>
          </AdminFormSection>

          <AdminFormSection title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminTextField label="이름 (한글)" name="name_ko" value={formData.name_ko} onChange={handleChange} required />
              <AdminTextField label="이름 (영문)" name="name_en" value={formData.name_en} onChange={handleChange} />
              <AdminTextField label="이름 (일본어)" name="name_ja" value={formData.name_ja} onChange={handleChange} />
              <div>
                <label className={ADMIN_STYLES.label}>모델 번호</label>
                <input type="text" name="model_number" value={formData.model_number} onChange={handleChange} placeholder="RX-78-2" className={`${ADMIN_STYLES.input} font-mono uppercase`} />
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="시리즈">
            <AdminSelectButtons 
              label="시리즈 선택" 
              options={series.map(s => ({ value: s.id, label: s.name_ko }))} 
              value={formData.series_id} 
              onChange={(v) => setFormData({ ...formData, series_id: v })} 
              accentColor={PAGE_CONFIG.color.bgSolid} 
              scrollable 
            />
          </AdminFormSection>

          <AdminFormSection title="제조사 (기업 우선)">
            <AdminSelectButtons 
              label="제조사 선택" 
              options={manufacturerOptions.map(org => ({ 
                value: org.id, 
                label: `${org.name_ko} [${getOrgTypeLabel(org.org_type)}]`,
                color: org.color
              }))} 
              value={selectedManufacturer} 
              onChange={setSelectedManufacturer} 
              accentColor="#9333EA"
              scrollable 
            />
          </AdminFormSection>

          <AdminFormSection title="운용 조직 (군사조직 우선)">
            <AdminSelectButtons 
              label="운용 조직 선택" 
              options={operatorOptions.map(org => ({ 
                value: org.id, 
                label: `${org.name_ko} [${getOrgTypeLabel(org.org_type)}]`,
                color: org.color
              }))} 
              value={selectedOperator} 
              onChange={setSelectedOperator} 
              accentColor="#2563EB"
              scrollable 
            />
          </AdminFormSection>

          {/* 파일럿 자동완성 - 모듈화된 컴포넌트 사용 */}
          <AdminFormSection title="메인 파일럿">
            <AdminAutocomplete<Pilot>
              label="파일럿 선택"
              placeholder="파일럿 이름 검색..."
              value={selectedPilot}
              onChange={setSelectedPilot}
              onSearch={searchPilots}
              displayField="name_ko"
              renderItem={(pilot) => (
                <div>
                  <div className="font-medium text-gray-900">{pilot.name_ko}</div>
                  <div className="text-sm text-gray-500">
                    {pilot.name_en && <span>{pilot.name_en}</span>}
                    <span className="ml-2 font-mono text-xs bg-gray-100 px-1 rounded">{pilot.id}</span>
                  </div>
                </div>
              )}
              selectedMessage={(pilot) => `파일럿 선택됨: ${pilot.name_ko}`}
            />
          </AdminFormSection>

          <AdminFormSection title="설명">
            <AdminTextarea label="" name="description" value={formData.description} onChange={handleChange} rows={4} />
          </AdminFormSection>

          <AdminSubmitButtons saving={saving} submitText="수정 완료" cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
        </form>
      </main>
    </div>
  )
}
