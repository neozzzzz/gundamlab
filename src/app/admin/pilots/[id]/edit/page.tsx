'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ImageUpload from '@/components/image-upload'
import { ADMIN_PAGES, ADMIN_STYLES, PILOT_ROLES } from '@/lib/constants/admin-config'
import { 
  AdminFormHeader,
  AdminTextField,
  AdminTextarea,
  AdminSelectButtons,
  AdminFormSection,
  AdminSubmitButtons,
  AdminLoading
} from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.pilots

export default function EditPilot() {
  const router = useRouter()
  const params = useParams()
  const pilotId = params?.id as string  // V1.10: id가 곧 code (VARCHAR)
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [factions, setFactions] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    name_ja: '',
    affiliation_default_id: '',
    rank: '',
    role: '',
    bio: '',
    birth_date: '',
    death_date: '',
    nationality: '',
    blood_type: '',
    height: '',
    weight: '',
    image_url: '',
  })

  useEffect(() => {
    const init = async () => {
      await loadFactions()
      if (pilotId) {
        await loadPilot()
      }
    }
    init()
  }, [pilotId])


  const loadFactions = async () => {
    const { data } = await supabase
      .from('factions')
      .select('*')
      .order('sort_order')
    
    setFactions(data || [])
  }

  const loadPilot = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('id', pilotId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          name_ko: data.name_ko || '',
          name_en: data.name_en || '',
          name_ja: data.name_ja || '',
          affiliation_default_id: data.affiliation_default_id || '',
          rank: data.rank || '',
          role: data.role || '',
          bio: data.bio || '',
          birth_date: data.birth_date || '',
          death_date: data.death_date || '',
          nationality: data.nationality || '',
          blood_type: data.blood_type || '',
          height: data.height?.toString() || '',
          weight: data.weight?.toString() || '',
          image_url: data.image_url || '',
        })
      }
    } catch (error: any) {
      console.error('파일럿 로딩 오류:', error)
      alert(`로딩 실패: ${error.message}`)
      router.push(PAGE_CONFIG.basePath)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name_ko.trim()) {
      alert('이름(한글)은 필수입니다.')
      return
    }

    try {
      setSaving(true)

      // V1.10: id는 변경 불가, 나머지 필드만 업데이트
      const pilotData = {
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        name_ja: formData.name_ja?.trim() || null,
        affiliation_default_id: formData.affiliation_default_id || null,
        rank: formData.rank?.trim() || null,
        role: formData.role || null,
        bio: formData.bio?.trim() || null,
        birth_date: formData.birth_date?.trim() || null,
        death_date: formData.death_date?.trim() || null,
        nationality: formData.nationality?.trim() || null,
        blood_type: formData.blood_type?.trim() || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        image_url: formData.image_url || null,
        updated_at: new Date().toISOString(),
      }

      const { data: updatedData, error } = await supabase
        .from('pilots')
        .update(pilotData)
        .eq('id', pilotId)
        .select()

      if (error) throw error

      if (!updatedData || updatedData.length === 0) {
        throw new Error('데이터가 수정되지 않았습니다.')
      }

      alert(`${PAGE_CONFIG.titleSingle}이(가) 성공적으로 수정되었습니다!`)
      router.push(PAGE_CONFIG.basePath)
      
    } catch (error: any) {
      console.error('수정 실패:', error)
      alert(`수정 실패: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <AdminLoading 
        message={`${PAGE_CONFIG.titleSingle} 정보를 불러오는 중...`} 
        spinnerColor={PAGE_CONFIG.color.primary} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader
        title={`${PAGE_CONFIG.titleSingle} 수정`}
        icon={PAGE_CONFIG.icon}
        backHref={PAGE_CONFIG.basePath}
      />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          {/* 프로필 이미지 */}
          <AdminFormSection title="프로필 이미지">
            <div className="max-w-xs">
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                bucket="images"
                folder="pilots"
                aspectRatio="aspect-[3/4]"
                placeholder="파일럿 이미지"
              />
            </div>
          </AdminFormSection>

          {/* 식별 정보 */}
          <AdminFormSection title="식별 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* V1.10: ID 읽기 전용 표시 */}
              <div>
                <label className={ADMIN_STYLES.label}>ID (코드)</label>
                <input
                  type="text"
                  value={pilotId}
                  disabled
                  className={`${ADMIN_STYLES.input} font-mono bg-gray-100 text-gray-600 cursor-not-allowed`}
                />
                <p className="text-xs text-gray-500 mt-1">ID는 변경할 수 없습니다</p>
              </div>

              <AdminTextField
                label="계급"
                name="rank"
                value={formData.rank}
                onChange={handleChange}
              />
            </div>
          </AdminFormSection>

          {/* 기본 정보 */}
          <AdminFormSection title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminTextField
                label="이름 (한글)"
                name="name_ko"
                value={formData.name_ko}
                onChange={handleChange}
                required
              />

              <AdminTextField
                label="이름 (영문)"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
              />

              <AdminTextField
                label="이름 (일본어)"
                name="name_ja"
                value={formData.name_ja}
                onChange={handleChange}
              />

              <AdminTextField
                label="국적"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
              />
            </div>
          </AdminFormSection>

          {/* 소속 & 역할 */}
          <AdminFormSection title="소속 & 역할">
            <div className="space-y-6">
              <AdminSelectButtons
                label="소속 진영"
                options={factions.map(f => ({ 
                  value: f.id, 
                  label: `${f.name_ko} (${f.id})`, 
                  color: f.color 
                }))}
                value={formData.affiliation_default_id}
                onChange={(v) => setFormData({ ...formData, affiliation_default_id: v })}
                scrollable
                emptyLabel="선택 안 함"
              />

              <AdminSelectButtons
                label="역할"
                options={PILOT_ROLES.map(r => ({ 
                  value: r.code, 
                  label: r.name 
                }))}
                value={formData.role}
                onChange={(v) => setFormData({ ...formData, role: v })}
                accentColor={PAGE_CONFIG.color.bgSolid}
              />
            </div>
          </AdminFormSection>

          {/* 신체 정보 */}
          <AdminFormSection title="신체 정보">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <AdminTextField
                label="생년월일"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                placeholder="U.C. 0063"
              />

              <AdminTextField
                label="사망일"
                name="death_date"
                value={formData.death_date}
                onChange={handleChange}
                placeholder="U.C. 0093"
              />

              <AdminTextField
                label="혈액형"
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
              />

              <AdminTextField
                label="신장 (cm)"
                name="height"
                value={formData.height}
                onChange={handleChange}
                type="number"
              />

              <AdminTextField
                label="체중 (kg)"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                type="number"
              />
            </div>
          </AdminFormSection>

          {/* 소개 */}
          <AdminFormSection title="소개">
            <AdminTextarea
              label=""
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
            />
          </AdminFormSection>

          {/* 제출 버튼 */}
          <AdminSubmitButtons
            saving={saving}
            submitText="수정 완료"
            cancelHref={PAGE_CONFIG.basePath}
            accentColor={PAGE_CONFIG.color.bgSolid}
            accentHoverColor={PAGE_CONFIG.color.bgSolidHover}
          />
        </form>
      </main>
    </div>
  )
}
