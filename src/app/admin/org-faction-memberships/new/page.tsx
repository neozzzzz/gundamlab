'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ADMIN_STYLES, UNIVERSE_CODES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminFormSection, AdminSubmitButtons, AdminLoading } from '@/components/admin'

const PAGE_CONFIG = {
  title: '조직-진영 관계 추가',
  basePath: '/admin/org-faction-memberships',
  icon: '/icons/admin/flag.svg',
  color: { bgSolid: '#6366F1', bgSolidHover: '#4F46E5' }
}

export default function NewOrgFactionMembershipPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<{ id: string; name_ko: string }[]>([])
  const [factions, setFactions] = useState<{ id: string; name_ko: string; color: string | null }[]>([])
  
  const [formData, setFormData] = useState({
    organization_id: '',
    faction_id: '',
    timeline_id: '',
    year_start: '',
    year_end: '',
    is_primary: false,
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])


  const fetchData = async () => {
    const { data: orgsData } = await supabase.from('organizations').select('id, name_ko').order('name_ko')
    setOrganizations(orgsData || [])
    
    const { data: factionsData } = await supabase.from('factions').select('id, name_ko, color').order('name_ko')
    setFactions(factionsData || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.organization_id || !formData.faction_id) {
      alert('조직과 진영은 필수입니다.')
      return
    }
    
    setSaving(true)
    
    const { error } = await supabase.from('org_faction_memberships').insert({
      organization_id: formData.organization_id,
      faction_id: formData.faction_id,
      timeline_id: formData.timeline_id || null,
      year_start: formData.year_start ? parseInt(formData.year_start) : null,
      year_end: formData.year_end ? parseInt(formData.year_end) : null,
      is_primary: formData.is_primary,
      notes: formData.notes || null,
    })
    
    if (error) {
      alert('저장 실패: ' + error.message)
      setSaving(false)
    } else {
      alert('관계가 추가되었습니다!')
      router.push(PAGE_CONFIG.basePath)
    }
  }

  const selectedFaction = factions.find(f => f.id === formData.faction_id)

  if (loading) {
    return <AdminLoading message="데이터를 불러오는 중..." spinnerColor={PAGE_CONFIG.color.bgSolid} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title={PAGE_CONFIG.title} icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          <AdminFormSection title="필수 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={ADMIN_STYLES.label}>조직 <span className="text-red-500">*</span></label>
                <select value={formData.organization_id} onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })} className={ADMIN_STYLES.input} required>
                  <option value="">조직 선택...</option>
                  {organizations.map(org => (<option key={org.id} value={org.id}>{org.name_ko} ({org.id})</option>))}
                </select>
              </div>
              <div>
                <label className={ADMIN_STYLES.label}>진영 <span className="text-red-500">*</span></label>
                <select value={formData.faction_id} onChange={(e) => setFormData({ ...formData, faction_id: e.target.value })} className={ADMIN_STYLES.input} required>
                  <option value="">진영 선택...</option>
                  {factions.map(f => (<option key={f.id} value={f.id}>{f.name_ko} ({f.id})</option>))}
                </select>
                {selectedFaction?.color && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${selectedFaction.color}20`, color: selectedFaction.color }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedFaction.color }} />
                      {selectedFaction.name_ko}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="추가 정보">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={ADMIN_STYLES.label}>타임라인</label>
                <select value={formData.timeline_id} onChange={(e) => setFormData({ ...formData, timeline_id: e.target.value })} className={ADMIN_STYLES.input}>
                  <option value="">선택 안 함</option>
                  {UNIVERSE_CODES.map(u => (<option key={u.code} value={u.code}>{u.name} ({u.code})</option>))}
                </select>
              </div>
              <div>
                <label className={ADMIN_STYLES.label}>시작 연도</label>
                <input type="number" value={formData.year_start} onChange={(e) => setFormData({ ...formData, year_start: e.target.value })} className={ADMIN_STYLES.input} placeholder="예: 0079" />
              </div>
              <div>
                <label className={ADMIN_STYLES.label}>종료 연도</label>
                <input type="number" value={formData.year_end} onChange={(e) => setFormData({ ...formData, year_end: e.target.value })} className={ADMIN_STYLES.input} placeholder="예: 0093 (비워두면 현재)" />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_primary} onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-sm font-medium text-gray-700">주요 소속 (이 조직의 대표 진영)</span>
              </label>
            </div>
          </AdminFormSection>

          <AdminFormSection title="비고">
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={ADMIN_STYLES.input} rows={3} placeholder="관계에 대한 추가 설명..." />
          </AdminFormSection>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 팁:</strong> 하나의 조직은 여러 진영에 소속될 수 있습니다.<br />
              예: 아나하임 일렉트로닉스는 지구연방과 에우고 양쪽에 기체를 공급했습니다.
            </p>
          </div>

          <AdminSubmitButtons saving={saving} submitText="관계 추가" cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
        </form>
      </main>
    </div>
  )
}
