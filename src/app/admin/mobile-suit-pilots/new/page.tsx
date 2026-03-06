'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ADMIN_STYLES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminFormSection, AdminSubmitButtons, AdminLoading, AdminSelectButtons } from '@/components/admin'
import AdminAutocomplete from '@/components/admin/AdminAutocomplete'

const PAGE_CONFIG = {
  title: 'MS-파일럿 관계 추가',
  basePath: '/admin/mobile-suit-pilots',
  icon: '/icons/admin/user.svg',
  color: { bgSolid: '#F59E0B', bgSolidHover: '#D97706' }
}

interface MobileSuit {
  id: string
  name_ko: string
  name_en?: string
  model_number?: string
}

interface Pilot {
  id: string
  name_ko: string
  name_en?: string
}

export default function NewMobileSuitPilotPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [factions, setFactions] = useState<{ id: string; name_ko: string; color: string | null }[]>([])
  
  const [selectedMs, setSelectedMs] = useState<MobileSuit | null>(null)
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(null)
  
  const [formData, setFormData] = useState({
    faction_at_time_id: '',
    is_primary: true,
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])


  const fetchData = async () => {
    const { data: factionsData } = await supabase.from('factions').select('id, name_ko, color').order('name_ko')
    setFactions(factionsData || [])
    setLoading(false)
  }

  // 모빌슈트 검색
  const searchMobileSuits = useCallback(async (query: string): Promise<MobileSuit[]> => {
    const { data } = await supabase
      .from('mobile_suits')
      .select('id, name_ko, name_en, model_number')
      .or(`name_ko.ilike.%${query}%,name_en.ilike.%${query}%,model_number.ilike.%${query}%`)
      .limit(10)
    return data || []
  }, [supabase])

  // 파일럿 검색
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
    
    if (!selectedMs || !selectedPilot) {
      alert('모빌슈트와 파일럿은 필수입니다.')
      return
    }
    
    setSaving(true)
    
    const { error } = await supabase.from('mobile_suit_pilots').insert({
      ms_id: selectedMs.id,
      pilot_id: selectedPilot.id,
      faction_at_time_id: formData.faction_at_time_id || null,
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

  if (loading) {
    return <AdminLoading message="데이터를 불러오는 중..." spinnerColor={PAGE_CONFIG.color.bgSolid} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title={PAGE_CONFIG.title} icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          <AdminFormSection title="모빌슈트 선택">
            <AdminAutocomplete<MobileSuit>
              label="모빌슈트 *"
              placeholder="모빌슈트 이름, 모델 번호로 검색..."
              value={selectedMs}
              onChange={setSelectedMs}
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

          <AdminFormSection title="파일럿 선택">
            <AdminAutocomplete<Pilot>
              label="파일럿 *"
              placeholder="파일럿 이름, ID로 검색..."
              value={selectedPilot}
              onChange={setSelectedPilot}
              onSearch={searchPilots}
              displayField="name_ko"
              renderItem={(p) => (
                <div>
                  <div className="font-medium text-gray-900">{p.name_ko}</div>
                  <div className="text-sm text-gray-500">
                    {p.name_en && <span>{p.name_en} </span>}
                    <span className="font-mono text-xs bg-gray-100 px-1 rounded">{p.id}</span>
                  </div>
                </div>
              )}
              selectedMessage={(p) => `파일럿 선택됨: ${p.name_ko} (${p.id})`}
            />
          </AdminFormSection>

          <AdminFormSection title="추가 정보">
            <div className="space-y-4">
              <AdminSelectButtons
                label="당시 소속 진영"
                options={factions.map(f => ({ value: f.id, label: f.name_ko }))}
                value={formData.faction_at_time_id}
                onChange={(val) => setFormData({ ...formData, faction_at_time_id: val })}
                allowEmpty={true}
                emptyLabel="선택 안 함"
                scrollable={true}
              />
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.is_primary} onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })} className="w-4 h-4 text-amber-600 rounded" />
                  <span className="text-sm font-medium text-gray-700">주요 파일럿 (이 MS의 대표 파일럿)</span>
                </label>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="비고">
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={ADMIN_STYLES.input} rows={3} placeholder="관계에 대한 추가 설명... (예: 탈취 후 탑승, 테스트 파일럿 등)" />
          </AdminFormSection>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>💡 팁:</strong> 하나의 모빌슈트는 여러 파일럿이 탑승할 수 있습니다.<br />
              예: 건담(RX-78-2)은 아무로 레이가 주요 파일럿이지만, 세이라 마스도 탑승한 적이 있습니다.
            </p>
          </div>

          <AdminSubmitButtons saving={saving} submitText="관계 추가" cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
        </form>
      </main>
    </div>
  )
}
