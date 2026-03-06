'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ADMIN_PAGES, ADMIN_STYLES, ORG_TYPES, UNIVERSE_CODES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminFormSection, AdminSubmitButtons, AdminLoading, AdminTextField, AdminSelectButtons } from '@/components/admin'
import type { OrgType } from '@/lib/types/database'

const PAGE_CONFIG = ADMIN_PAGES.organizations

export default function NewOrganizationPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [parentOrgs, setParentOrgs] = useState<{ id: string; name_ko: string }[]>([])
  
  const [formData, setFormData] = useState({
    id: '',
    name_ko: '',
    name_en: '',
    name_ja: '',
    org_type: 'OTHER' as OrgType,
    universe: '',
    parent_id: '',
    color: '',
    description: '',
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchParentOrgs()
  }, [])


  const fetchParentOrgs = async () => {
    const { data } = await supabase.from('organizations').select('id, name_ko').order('name_ko')
    if (data) setParentOrgs(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.id.trim() || !formData.name_ko.trim()) {
      alert('ID와 조직명(한글)은 필수입니다.')
      return
    }
    
    setSaving(true)
    
    const { error } = await supabase.from('organizations').insert({
      id: formData.id.trim(),
      name_ko: formData.name_ko.trim(),
      name_en: formData.name_en?.trim() || null,
      name_ja: formData.name_ja?.trim() || null,
      org_type: formData.org_type,
      universe: formData.universe || null,
      parent_id: formData.parent_id || null,
      color: formData.color || null,
      description: formData.description?.trim() || null,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
    })
    
    if (error) {
      alert('저장 실패: ' + error.message)
      setSaving(false)
    } else {
      alert('조직이 추가되었습니다!')
      router.push(PAGE_CONFIG.basePath)
    }
  }

  if (loading) {
    return <AdminLoading message="데이터를 불러오는 중..." spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title="새 조직 추가" icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          <AdminFormSection title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={ADMIN_STYLES.label}>ID <span className="text-red-500">*</span></label>
                <input type="text" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })} className={ADMIN_STYLES.input} placeholder="예: EFSF, AE, ZAFT" required />
                <p className="text-xs text-gray-500 mt-1">고유 식별 코드 (대문자 권장)</p>
              </div>
              <AdminTextField label="조직명 (한글)" name="name_ko" value={formData.name_ko} onChange={(e) => setFormData({ ...formData, name_ko: e.target.value })} required />
              <AdminTextField label="조직명 (영문)" name="name_en" value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
              <AdminTextField label="조직명 (일본어)" name="name_ja" value={formData.name_ja} onChange={(e) => setFormData({ ...formData, name_ja: e.target.value })} />
            </div>
          </AdminFormSection>

          <AdminFormSection title="조직 유형">
            <AdminSelectButtons
              label="유형 선택"
              options={ORG_TYPES.map(t => ({ value: t.code, label: t.name }))}
              value={formData.org_type}
              onChange={(val) => setFormData({ ...formData, org_type: val as OrgType })}
              allowEmpty={false}
              required
            />
          </AdminFormSection>

          <AdminFormSection title="타임라인">
            <AdminSelectButtons
              label="타임라인 선택"
              options={UNIVERSE_CODES.map(u => ({ value: u.code, label: u.name }))}
              value={formData.universe}
              onChange={(val) => setFormData({ ...formData, universe: val })}
              allowEmpty={true}
              emptyLabel="선택 안 함"
              scrollable={true}
            />
          </AdminFormSection>

          <AdminFormSection title="추가 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={ADMIN_STYLES.label}>상위 조직</label>
                <select value={formData.parent_id} onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })} className={ADMIN_STYLES.input}>
                  <option value="">없음</option>
                  {parentOrgs.map(org => (<option key={org.id} value={org.id}>{org.name_ko} ({org.id})</option>))}
                </select>
                <p className="text-xs text-gray-500 mt-1">조직 계층 구조용</p>
              </div>
              <div>
                <label className={ADMIN_STYLES.label}>색상</label>
                <div className="flex gap-2">
                  <input type="color" value={formData.color?.startsWith('#') ? formData.color : '#6B7280'} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-12 h-10 rounded border border-gray-300" />
                  <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className={ADMIN_STYLES.input} placeholder="#RRGGBB" />
                </div>
              </div>
              <div>
                <label className={ADMIN_STYLES.label}>정렬 순서</label>
                <input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} className={ADMIN_STYLES.input} />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-purple-600 rounded" />
                  <span className="text-sm font-medium text-gray-700">활성 상태</span>
                </label>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="설명">
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={ADMIN_STYLES.input} rows={3} placeholder="조직에 대한 설명..." />
          </AdminFormSection>

          <AdminSubmitButtons saving={saving} submitText="조직 추가" cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} />
        </form>
      </main>
    </div>
  )
}
