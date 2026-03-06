'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ADMIN_PAGES, ADMIN_STYLES, UNIVERSES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminTextField, AdminTextarea, AdminSelectButtons, AdminFormSection, AdminSubmitButtons, AdminLoading } from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.factions

export default function EditFaction() {
  const router = useRouter()
  const params = useParams()
  const factionId = params?.id as string  // V1.10: id가 곧 code (VARCHAR)
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    universe: '',
    color: '#3B82F6',
    description: '',
    sort_order: '0',
  })

  useEffect(() => {
    const init = async () => {
      if (factionId) await loadFaction()
    }
    init()
  }, [factionId])


  const loadFaction = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('factions').select('*').eq('id', factionId).single()
      if (error) throw error

      const faction = data as any
      if (faction) {
        setFormData({
          name_ko: faction.name_ko || '',
          name_en: faction.name_en || '',
          universe: faction.universe || '',
          color: faction.color || '#3B82F6',
          description: faction.description || '',
          sort_order: faction.sort_order?.toString() || '0',
        })
      }
    } catch (error: any) {
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
      // V1.10: id(code)는 변경 불가, 나머지 필드만 업데이트
      const { error } = await supabase.from('factions').update({
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        universe: formData.universe || null,
        color: formData.color || null,
        description: formData.description?.trim() || null,
        sort_order: parseInt(formData.sort_order) || 0,
        updated_at: new Date().toISOString(),
      }).eq('id', factionId).select()

      if (error) throw error
      alert(`${PAGE_CONFIG.titleSingle}이(가) 성공적으로 수정되었습니다!`)
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

  if (loading) {
    return <AdminLoading message={`${PAGE_CONFIG.titleSingle} 정보를 불러오는 중...`} spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title={`${PAGE_CONFIG.titleSingle} 수정`} icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          <AdminFormSection title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* V1.10: ID 읽기 전용 표시 */}
              <div>
                <label className={ADMIN_STYLES.label}>ID (코드)</label>
                <input 
                  type="text" 
                  value={factionId} 
                  disabled 
                  className={`${ADMIN_STYLES.input} font-mono bg-gray-100 text-gray-600 cursor-not-allowed`} 
                />
                <p className="text-xs text-gray-500 mt-1">ID는 변경할 수 없습니다</p>
              </div>
              <AdminTextField label="정렬 순서" name="sort_order" value={formData.sort_order} onChange={handleChange} type="number" />
              <AdminTextField label="이름 (한글)" name="name_ko" value={formData.name_ko} onChange={handleChange} required />
              <AdminTextField label="이름 (영문)" name="name_en" value={formData.name_en} onChange={handleChange} />
            </div>
          </AdminFormSection>

          <AdminFormSection title="세계관 & 색상">
            <div className="space-y-6">
              <AdminSelectButtons label="세계관" options={UNIVERSES.map(u => ({ value: u.code, label: u.name }))} value={formData.universe} onChange={(v) => setFormData({ ...formData, universe: v })} accentColor={PAGE_CONFIG.color.bgSolid} />
              <div>
                <label className={ADMIN_STYLES.label}>대표 색상</label>
                <div className="flex items-center gap-4">
                  <input type="color" name="color" value={formData.color} onChange={handleChange} className="w-16 h-10 rounded border border-gray-300 cursor-pointer" />
                  <input type="text" name="color" value={formData.color} onChange={handleChange} className={`${ADMIN_STYLES.input} font-mono w-32`} />
                </div>
              </div>
            </div>
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
