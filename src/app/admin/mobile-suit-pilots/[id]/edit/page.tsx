'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { ADMIN_STYLES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminFormSection, AdminSubmitButtons, AdminLoading, AdminSelectButtons } from '@/components/admin'
import AdminAutocomplete from '@/components/admin/AdminAutocomplete'

const PAGE_CONFIG = {
  title: 'MS-파일럿 관계 수정',
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

export default function EditMobileSuitPilotPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  }, [id])


  const fetchData = async () => {
    // 진영 목록
    const { data: factionsData } = await supabase.from('factions').select('id, name_ko, color').order('name_ko')
    setFactions(factionsData || [])
    
    // 현재 데이터 로드
    const { data, error } = await supabase.from('mobile_suit_pilots').select('*').eq('id', id).single()
    
    if (error || !data) {
      alert('데이터를 찾을 수 없습니다.')
      router.push(PAGE_CONFIG.basePath)
      return
    }
    
    // 연결된 모빌슈트 로드
    if (data.ms_id) {
      const { data: msData } = await supabase.from('mobile_suits').select('id, name_ko, name_en, model_number').eq('id', data.ms_id).single()
      if (msData) setSelectedMs(msData)
    }
    
    // 연결된 파일럿 로드
    if (data.pilot_id) {
      const { data: pilotData } = await supabase.from('pilots').select('id, name_ko, name_en').eq('id', data.pilot_id).single()
      if (pilotData) setSelectedPilot(pilotData)
    }
    
    setFormData({
      faction_at_time_id: data.faction_at_time_id || '',
      is_primary: data.is_primary ?? true,
      notes: data.notes || '',
    })
    
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
    
    const { error } = await supabase.from('mobile_suit_pilots').update({
      ms_id: selectedMs.id,
      pilot_id: selectedPilot.id,
      faction_at_time_id: formData.faction_at_time_id || null,
      is_primary: formData.is_primary,
      notes: formData.notes || null,
    }).eq('id', id)
    
    if (error) {
      alert('저장 실패: ' + error.message)
      setSaving(false)
    } else {
      alert('관계가 수정되었습니다!')
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
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={ADMIN_STYLES.input} rows={3} placeholder="관계에 대한 추가 설명..." />
          </AdminFormSection>

          <AdminSubmitButtons saving={saving} submitText="수정 완료" cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
        </form>
      </main>
    </div>
  )
}
