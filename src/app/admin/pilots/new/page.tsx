'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ImageUpload from '@/components/image-upload'
import { ADMIN_PAGES, ADMIN_STYLES, PILOT_ROLES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminTextField, AdminTextarea, AdminSelectButtons, AdminFormSection, AdminSubmitButtons, AdminLoading } from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.pilots

export default function AddPilot() {
  const router = useRouter()
  const supabase = createClient()
  
  const [saving, setSaving] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [factions, setFactions] = useState<any[]>([])
  
  // V1.10: id 직접 입력 (예: 'AMURO-RAY', 'CHAR-AZNABLE')
  const [formData, setFormData] = useState({
    id: '',               // V1.10: code가 곧 id
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
    loadData()
  }, [])


  const loadData = async () => {
    try {
      setDataLoading(true)
      const { data } = await supabase.from('factions').select('*').order('sort_order')
      setFactions(data || [])
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
      alert('ID(코드)와 파일럿 이름(한글)은 필수입니다.')
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.from('pilots').insert([{
        id: formData.id.trim().toUpperCase(),  // V1.10: id 직접 입력
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
      }]).select()

      if (error) throw error
      alert(`${PAGE_CONFIG.titleSingle}이(가) 성공적으로 추가되었습니다!`)
      router.push(PAGE_CONFIG.basePath)
    } catch (error: any) {
      alert(`오류: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          
          <AdminFormSection title="프로필 이미지">
            <div className="max-w-xs">
              <ImageUpload value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} bucket="images" folder="pilots" aspectRatio="aspect-[3/4]" placeholder="파일럿 이미지" />
            </div>
          </AdminFormSection>

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
                  placeholder="AMURO-RAY" 
                  className={`${ADMIN_STYLES.input} font-mono uppercase`} 
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">고유 식별자 (예: AMURO-RAY, CHAR-AZNABLE)</p>
              </div>
              <AdminTextField label="계급" name="rank" value={formData.rank} onChange={handleChange} />
            </div>
          </AdminFormSection>

          <AdminFormSection title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminTextField label="이름 (한글)" name="name_ko" value={formData.name_ko} onChange={handleChange} required />
              <AdminTextField label="이름 (영문)" name="name_en" value={formData.name_en} onChange={handleChange} />
              <AdminTextField label="이름 (일본어)" name="name_ja" value={formData.name_ja} onChange={handleChange} />
              <AdminTextField label="국적" name="nationality" value={formData.nationality} onChange={handleChange} />
            </div>
          </AdminFormSection>

          <AdminFormSection title="소속 & 역할">
            <div className="space-y-6">
              <AdminSelectButtons 
                label="소속 진영" 
                options={factions.map(f => ({ value: f.id, label: `${f.name_ko} (${f.id})`, color: f.color }))} 
                value={formData.affiliation_default_id} 
                onChange={(v) => setFormData({ ...formData, affiliation_default_id: v })} 
                scrollable 
                emptyLabel="선택 안 함" 
              />
              <AdminSelectButtons label="역할" options={PILOT_ROLES.map(r => ({ value: r.code, label: r.name }))} value={formData.role} onChange={(v) => setFormData({ ...formData, role: v })} accentColor={PAGE_CONFIG.color.bgSolid} />
            </div>
          </AdminFormSection>

          <AdminFormSection title="신체 정보">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <AdminTextField label="생년월일" name="birth_date" value={formData.birth_date} onChange={handleChange} placeholder="U.C. 0063" />
              <AdminTextField label="사망일" name="death_date" value={formData.death_date} onChange={handleChange} placeholder="U.C. 0093" />
              <AdminTextField label="혈액형" name="blood_type" value={formData.blood_type} onChange={handleChange} />
              <AdminTextField label="신장 (cm)" name="height" value={formData.height} onChange={handleChange} type="number" />
              <AdminTextField label="체중 (kg)" name="weight" value={formData.weight} onChange={handleChange} type="number" />
            </div>
          </AdminFormSection>

          <AdminFormSection title="소개">
            <AdminTextarea label="" name="bio" value={formData.bio} onChange={handleChange} rows={4} />
          </AdminFormSection>

          {/* ID 예시 안내 */}
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>ID 예시:</strong><br />
              AMURO-RAY, CHAR-AZNABLE, KIRA-YAMATO, SETSUNA-F-SEIEI
            </p>
          </div>

          <AdminSubmitButtons saving={saving} submitText={`${PAGE_CONFIG.titleSingle} 추가`} cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
        </form>
      </main>
    </div>
  )
}
