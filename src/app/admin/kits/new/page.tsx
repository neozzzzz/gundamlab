'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import ImageUpload from '@/components/image-upload'
import { ADMIN_PAGES, ADMIN_STYLES } from '@/lib/constants/admin-config'
import { 
  AdminFormHeader, 
  AdminTextField, 
  AdminTextarea, 
  AdminSelectButtons, 
  AdminFormSection, 
  AdminSubmitButtons,
  AdminLoading 
} from '@/components/admin'
import AdminAutocomplete from '@/components/admin/AdminAutocomplete'

const PAGE_CONFIG = ADMIN_PAGES.kits

const STATUS_OPTIONS = [
  { value: 'active', label: '판매중', color: '#16A34A' },
  { value: 'discontinued', label: '단종', color: '#4B5563' },
  { value: 'upcoming', label: '출시예정', color: '#CA8A04' },
]

// 모빌슈트 타입 정의
interface MobileSuit {
  id: string
  name_ko: string
  name_en?: string
  model_number?: string
}

export default function AddKit() {
  const router = useRouter()
  const supabase = createClient()
  
  const [saving, setSaving] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [grades, setGrades] = useState<any[]>([])
  const [series, setSeries] = useState<any[]>([])
  
  // 모빌슈트 자동완성용
  const [selectedMobileSuit, setSelectedMobileSuit] = useState<MobileSuit | null>(null)
  
  const scaleOptions = ['1/144', '1/100', '1/60', 'Non-scale']
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    grade_id: '',
    series_id: '',
    scale: '1/144',
    price_krw: '',
    price_jpy: '',
    product_code: '',
    release_date: '',
    description: '',
    status: '',
    box_art_url: '',
  })

  useEffect(() => {
    loadData()
  }, [])


  const loadData = async () => {
    try {
      setDataLoading(true)
      
      // V1.10: grades.id가 곧 코드 (예: 'HG', 'MG')
      const [gradesRes, seriesRes] = await Promise.all([
        supabase.from('grades').select('id, name_ko').order('sort_order'),
        supabase.from('series').select('id, name_ko').order('name_ko'),
      ])

      setGrades(gradesRes.data || [])
      setSeries(seriesRes.data || [])
    } catch (error) {
      console.error('데이터 로딩 오류:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // 모빌슈트 검색 함수
  const searchMobileSuits = useCallback(async (query: string): Promise<MobileSuit[]> => {
    const { data } = await supabase
      .from('mobile_suits')
      .select('id, name_ko, name_en, model_number')
      .or(`name_ko.ilike.%${query}%,name_en.ilike.%${query}%,model_number.ilike.%${query}%`)
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

      const kitData = {
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        grade_id: formData.grade_id || null,
        series_id: formData.series_id || null,
        mobile_suit_id: selectedMobileSuit?.id || null,
        scale: formData.scale || null,
        price_krw: formData.price_krw ? parseInt(formData.price_krw) : null,
        price_jpy: formData.price_jpy ? parseInt(formData.price_jpy) : null,
        product_code: formData.product_code?.trim() || null,
        release_date: formData.release_date || null,
        description: formData.description?.trim() || null,
        status: formData.status,
        box_art_url: formData.box_art_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('gundam_kits').insert([kitData]).select()
      if (error) throw error

      alert(`${PAGE_CONFIG.titleSingle}이(가) 성공적으로 추가되었습니다!`)
      router.push(PAGE_CONFIG.basePath)
    } catch (error: any) {
      alert(`오류: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (dataLoading) {
    return <AdminLoading message="데이터를 불러오는 중..." spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title={`새 ${PAGE_CONFIG.titleSingle} 추가`} icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          <AdminFormSection title="박스아트">
            <div className="max-w-xs">
              <ImageUpload value={formData.box_art_url} onChange={(url) => setFormData({ ...formData, box_art_url: url })} bucket="images" folder="kits" aspectRatio="aspect-[4/3]" placeholder="박스아트 이미지" />
            </div>
          </AdminFormSection>

          <AdminFormSection title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminTextField label="킷 이름 (한글)" name="name_ko" value={formData.name_ko} onChange={handleChange} required />
              <AdminTextField label="킷 이름 (영문)" name="name_en" value={formData.name_en} onChange={handleChange} />
            </div>

            <div className="mt-6">
              <AdminSelectButtons
                label="등급"
                options={grades.map(g => ({ value: g.id, label: g.id }))}
                value={formData.grade_id}
                onChange={(v) => setFormData({ ...formData, grade_id: v })}
                accentColor={PAGE_CONFIG.color.bgSolid}
              />
            </div>

            <div className="mt-6">
              <AdminSelectButtons
                label="스케일"
                options={scaleOptions.map(s => ({ value: s, label: s }))}
                value={formData.scale}
                onChange={(v) => setFormData({ ...formData, scale: v })}
                accentColor={PAGE_CONFIG.color.bgSolid}
                allowEmpty={false}
              />
            </div>

            <div className="mt-6">
              <AdminSelectButtons
                label="시리즈"
                options={series.map(s => ({ value: s.id, label: s.name_ko }))}
                value={formData.series_id}
                onChange={(v) => setFormData({ ...formData, series_id: v })}
                accentColor={PAGE_CONFIG.color.bgSolid}
                scrollable
              />
            </div>
          </AdminFormSection>

          {/* 모빌슈트 연결 - AdminAutocomplete 사용 */}
          <AdminFormSection title="모빌슈트 연결">
            <AdminAutocomplete<MobileSuit>
              label="모빌슈트 선택"
              placeholder="모빌슈트 이름, 모델 번호로 검색..."
              value={selectedMobileSuit}
              onChange={setSelectedMobileSuit}
              onSearch={searchMobileSuits}
              displayField="name_ko"
              renderItem={(ms) => (
                <div>
                  <div className="font-medium text-gray-900">{ms.name_ko}</div>
                  <div className="text-sm text-gray-500">
                    {ms.name_en && <span>{ms.name_en}</span>}
                    {ms.model_number && <span className="ml-2 font-mono text-xs bg-gray-100 px-1 rounded">{ms.model_number}</span>}
                  </div>
                </div>
              )}
              selectedMessage={(ms) => `모빌슈트 선택됨: ${ms.name_ko}${ms.model_number ? ` (${ms.model_number})` : ''}`}
            />
          </AdminFormSection>

          <AdminFormSection title="가격 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminTextField label="가격 (원)" name="price_krw" value={formData.price_krw} onChange={handleChange} type="number" placeholder="25000" />
              <AdminTextField label="가격 (엔)" name="price_jpy" value={formData.price_jpy} onChange={handleChange} type="number" placeholder="2500" />
            </div>
          </AdminFormSection>

          <AdminFormSection title="추가 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={ADMIN_STYLES.label}>제품 코드</label>
                <input type="text" name="product_code" value={formData.product_code} onChange={handleChange} placeholder="BAN123456" className={`${ADMIN_STYLES.input} font-mono`} />
              </div>
              <div>
                <label className={ADMIN_STYLES.label}>발매일</label>
                <input type="date" name="release_date" value={formData.release_date} onChange={handleChange} className={ADMIN_STYLES.input} />
              </div>
            </div>
            <div className="mt-6">
              <AdminTextarea label="설명" name="description" value={formData.description} onChange={handleChange} placeholder="킷에 대한 설명..." />
            </div>
          </AdminFormSection>

          <AdminFormSection title="상태">
            <AdminSelectButtons
              label=""
              options={STATUS_OPTIONS}
              value={formData.status}
              onChange={(v) => setFormData({ ...formData, status: v })}
              allowEmpty={true}
            />
          </AdminFormSection>

          <AdminSubmitButtons saving={saving} submitText={`${PAGE_CONFIG.titleSingle} 추가`} cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
        </form>
      </main>
    </div>
  )
}
