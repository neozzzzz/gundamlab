'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ADMIN_PAGES, ADMIN_STYLES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminTextField, AdminTextarea, AdminFormSection, AdminSubmitButtons, AdminLoading } from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.series

export default function AddSeries() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [timelines, setTimelines] = useState<any[]>([])
  
  // V1.10: id 직접 입력 (예: 'UC-0079', 'SEED', '00')
  const [formData, setFormData] = useState({
    id: '',             // V1.10: code가 곧 id
    timeline_id: '',
    name_ko: '',
    name_en: '',
    name_ja: '',
    year_start: '',
    year_end: '',
    media_type: '',
    description: '',
  })

  useEffect(() => {
    loadData()
  }, [])


  const loadData = async () => {
    try {
      setDataLoading(true)
      const { data } = await supabase.from('timelines').select('*').order('sort_order')
      setTimelines(data || [])
    } catch (error) {
      console.error('데이터 로딩 오류:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // V1.10: id와 이름 필수 검증
    if (!formData.id.trim() || !formData.name_ko.trim()) {
      alert('ID(코드)와 시리즈 이름(한글)은 필수입니다.')
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.from('series').insert([{
        id: formData.id.trim().toUpperCase(),  // V1.10: id 직접 입력
        timeline_id: formData.timeline_id || null,
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        name_ja: formData.name_ja?.trim() || null,
        year_start: formData.year_start ? parseInt(formData.year_start) : null,
        year_end: formData.year_end ? parseInt(formData.year_end) : null,
        media_type: formData.media_type || null,
        description: formData.description?.trim() || null,
      }]).select()

      if (error) throw error
      alert(`${PAGE_CONFIG.titleSingle}가 성공적으로 추가되었습니다!`)
      router.push(PAGE_CONFIG.basePath)
    } catch (error: any) {
      alert(`오류: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          <AdminFormSection title="식별 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* V1.10: ID 필드 (필수) */}
              <div>
                <label className={ADMIN_STYLES.label}>ID (코드) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="id" 
                  value={formData.id} 
                  onChange={handleChange} 
                  placeholder="UC-0079, SEED, 00" 
                  className={`${ADMIN_STYLES.input} font-mono uppercase`} 
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">고유 식별자 (예: UC-0079, SEED-DESTINY)</p>
              </div>
              <div>
                <label className={ADMIN_STYLES.label}>타임라인</label>
                <select name="timeline_id" value={formData.timeline_id} onChange={handleChange} className={ADMIN_STYLES.input}>
                  <option value="">선택 안 함</option>
                  {timelines.map(t => (
                    <option key={t.id} value={t.id}>{t.name_ko} ({t.id})</option>
                  ))}
                </select>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="기본 정보">
            <div className="space-y-6">
              <AdminTextField label="시리즈 이름 (한글)" name="name_ko" value={formData.name_ko} onChange={handleChange} required placeholder="예: 기동전사 건담" />
              <AdminTextField label="시리즈 이름 (영문)" name="name_en" value={formData.name_en} onChange={handleChange} placeholder="예: Mobile Suit Gundam" />
              <AdminTextField label="시리즈 이름 (일본어)" name="name_ja" value={formData.name_ja} onChange={handleChange} placeholder="예: 機動戦士ガンダム" />
            </div>
          </AdminFormSection>

          <AdminFormSection title="방영 정보">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AdminTextField label="방영 시작년도" name="year_start" value={formData.year_start} onChange={handleChange} type="number" placeholder="1979" />
              <AdminTextField label="방영 종료년도" name="year_end" value={formData.year_end} onChange={handleChange} type="number" placeholder="1980" />
              <div>
                <label className={ADMIN_STYLES.label}>미디어 유형</label>
                <select name="media_type" value={formData.media_type} onChange={handleChange} className={ADMIN_STYLES.input}>
                  <option value="">선택 안 함</option>
                  <option value="TV">TV 시리즈</option>
                  <option value="OVA">OVA</option>
                  <option value="MOVIE">극장판</option>
                  <option value="ONA">ONA</option>
                  <option value="MANGA">만화</option>
                  <option value="NOVEL">소설</option>
                  <option value="GAME">게임</option>
                </select>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="설명">
            <AdminTextarea label="" name="description" value={formData.description} onChange={handleChange} placeholder="시리즈에 대한 설명을 입력하세요..." rows={4} />
          </AdminFormSection>

          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>ID 예시:</strong><br />
              UC-0079 (기동전사 건담), SEED, SEED-DESTINY, 00, IBO, WITCH
            </p>
          </div>

          <div className="mt-8">
            <AdminSubmitButtons saving={saving} submitText={`${PAGE_CONFIG.titleSingle} 추가`} cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
          </div>
        </form>
      </main>
    </div>
  )
}
