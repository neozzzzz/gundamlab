'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ADMIN_PAGES, ADMIN_STYLES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminTextField, AdminTextarea, AdminFormSection, AdminSubmitButtons, AdminLoading } from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.series

export default function EditSeries() {
  const router = useRouter()
  const params = useParams()
  // URL에서 받은 ID를 디코딩 (한글 ID 지원)
  const seriesId = params?.id ? decodeURIComponent(params.id as string) : ''
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    name_ja: '',
    description: '',
  })

  useEffect(() => {
    const init = async () => {
      if (seriesId) await loadSeries()
    }
    init()
  }, [seriesId])


  const loadSeries = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('series').select('*').eq('id', seriesId).single()
      if (error) throw error

      if (data) {
        setFormData({
          name_ko: data.name_ko || '',
          name_en: data.name_en || '',
          name_ja: data.name_ja || '',
          description: data.description || '',
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
      alert(`${PAGE_CONFIG.titleSingle} 이름(한글)은 필수입니다.`)
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.from('series').update({
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        name_ja: formData.name_ja?.trim() || null,
        description: formData.description?.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', seriesId)

      if (error) throw error
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

  if (loading) {
    return <AdminLoading message={`${PAGE_CONFIG.titleSingle} 정보를 불러오는 중...`} spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title={`${PAGE_CONFIG.titleSingle} 수정`} icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          <AdminFormSection title="기본 정보">
            <div className="space-y-6">
              <AdminTextField label="시리즈 이름 (한글)" name="name_ko" value={formData.name_ko} onChange={handleChange} required />
              <AdminTextField label="시리즈 이름 (영문)" name="name_en" value={formData.name_en} onChange={handleChange} />
              <AdminTextField label="시리즈 이름 (일본어)" name="name_ja" value={formData.name_ja} onChange={handleChange} />
              <AdminTextarea label="설명" name="description" value={formData.description} onChange={handleChange} />
            </div>
          </AdminFormSection>

          <AdminSubmitButtons saving={saving} submitText="수정 완료" cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} />
        </form>
      </main>
    </div>
  )
}
