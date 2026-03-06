'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ADMIN_PAGES, ADMIN_STYLES, UNIVERSES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminTextField, AdminTextarea, AdminSelectButtons, AdminFormSection, AdminSubmitButtons } from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.factions

export default function AddFaction() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  
  // V1.10: code가 곧 id (예: 'EFSF', 'ZEON')
  const [formData, setFormData] = useState({
    id: '',           // V1.10: code → id로 변경
    name_ko: '',
    name_en: '',
    universe: '',
    color: '#3B82F6',
    description: '',
    sort_order: '0',
  })

  useEffect(() => {
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // V1.10: id(코드)와 이름 필수 검증
    if (!formData.id.trim() || !formData.name_ko.trim()) {
      alert('ID(코드)와 이름(한글)은 필수입니다.')
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.from('factions').insert([{
        id: formData.id.trim().toUpperCase(),  // V1.10: id 직접 입력
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        universe: formData.universe || null,
        color: formData.color || null,
        description: formData.description?.trim() || null,
        sort_order: parseInt(formData.sort_order) || 0,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title={`새 ${PAGE_CONFIG.titleSingle} 추가`} icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          <AdminFormSection title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* V1.10: ID 필드 (필수, 대문자) */}
              <div>
                <label className={ADMIN_STYLES.label}>ID (코드) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="id" 
                  value={formData.id} 
                  onChange={handleChange} 
                  placeholder="EFSF" 
                  className={`${ADMIN_STYLES.input} font-mono uppercase`} 
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">고유 식별자 (대문자, 하이픈 가능)</p>
              </div>
              <AdminTextField label="정렬 순서" name="sort_order" value={formData.sort_order} onChange={handleChange} type="number" />
              <AdminTextField label="이름 (한글)" name="name_ko" value={formData.name_ko} onChange={handleChange} required placeholder="지구연방군" />
              <AdminTextField label="이름 (영문)" name="name_en" value={formData.name_en} onChange={handleChange} placeholder="Earth Federation Space Force" />
            </div>
          </AdminFormSection>

          <AdminFormSection title="세계관 & 색상">
            <div className="space-y-6">
              <AdminSelectButtons label="세계관" options={UNIVERSES.map(u => ({ value: u.code, label: u.name }))} value={formData.universe} onChange={(v) => setFormData({ ...formData, universe: v })} accentColor={PAGE_CONFIG.color.bgSolid} />
              <div>
                <label className={ADMIN_STYLES.label}>대표 색상</label>
                <div className="flex items-center gap-4">
                  <input type="color" name="color" value={formData.color} onChange={handleChange} className="w-16 h-10 rounded border border-gray-300 cursor-pointer" />
                  <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="#3B82F6" className={`${ADMIN_STYLES.input} font-mono w-32`} />
                </div>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="설명">
            <AdminTextarea label="" name="description" value={formData.description} onChange={handleChange} rows={4} />
          </AdminFormSection>

          <AdminSubmitButtons saving={saving} submitText={`${PAGE_CONFIG.titleSingle} 추가`} cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
        </form>
      </main>
    </div>
  )
}
