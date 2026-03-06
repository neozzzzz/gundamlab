// src/lib/constants/admin-config.ts
// Admin 페이지 통합 설정 (V1.9 - organizations 추가, companies 교체)

import { OrgType, MsRelationshipType } from '@/lib/types/database'

// ============================================
// 공통 스타일
// ============================================
export const ADMIN_STYLES = {
  // 페이지 컨테이너
  pageContainer: 'p-6 max-w-7xl mx-auto',
  
  // V1.10 메인 컨테이너
  mainContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  
  // 헤더
  header: 'flex justify-between items-center mb-6',
  title: 'text-2xl font-bold text-gray-900',
  
  // 버튼
  primaryButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2',
  secondaryButton: 'bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors',
  dangerButton: 'bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm',
  editButton: 'bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm',
  
  // 필터/검색
  filterContainer: 'bg-white p-4 rounded-lg shadow mb-6',
  filterGrid: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  filterSelect: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900',
  searchInput: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900',
  
  // V1.10 카드 스타일
  filterCard: 'bg-white rounded-xl shadow-sm p-6 mb-6',
  tableCard: 'bg-white rounded-xl shadow-sm overflow-hidden',
  formCard: 'bg-white rounded-xl shadow-sm p-8 space-y-8',
  
  // 테이블
  tableContainer: 'bg-white rounded-lg shadow overflow-hidden',
  table: 'min-w-full divide-y divide-gray-200',
  tableHeader: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  tableHeaderCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  tableBody: 'bg-white divide-y divide-gray-200',
  tableRow: 'hover:bg-gray-50',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
  
  // 뱃지
  badge: 'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
  badgeBlue: 'bg-blue-100 text-blue-800',
  badgeGreen: 'bg-green-100 text-green-800',
  badgeRed: 'bg-red-100 text-red-800',
  badgeYellow: 'bg-yellow-100 text-yellow-800',
  badgePurple: 'bg-purple-100 text-purple-800',
  badgeGray: 'bg-gray-100 text-gray-800',
  
  // 폼 (레거시)
  formContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  formGrid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  formGroup: 'space-y-2',
  formLabel: 'block text-sm font-medium text-gray-700',
  formInput: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900',
  formTextarea: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] bg-white text-gray-900',
  formSelect: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900',
  formCheckbox: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
  
  // V1.10 폼 스타일
  input: 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900',
  label: 'block text-sm font-medium text-gray-700 mb-1',
  required: 'text-red-500 ml-1',
  sectionTitle: 'text-lg font-semibold text-gray-900 mb-4',
  codeBadge: 'inline-flex items-center rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700',
  
  // 상태
  loadingText: 'text-center py-8 text-gray-500',
  errorText: 'text-center py-8 text-red-500',
  emptyText: 'text-center py-8 text-gray-500',
}

// ============================================
// Admin 페이지 설정 (레거시 호환 포함)
// ============================================
export const ADMIN_PAGES = {
  kits: {
    title: '건프라 킷 관리',
    titleSingle: '킷',
    tableName: 'gundam_kits',
    basePath: '/admin/kits',
    icon: '/icons/admin/box.svg',
    itemUnit: '킷',
    searchPlaceholder: '킷 이름 검색...',
    color: { primary: '#3B82F6', bgSolid: '#3B82F6', bgSolidHover: '#2563EB', text: 'text-blue-600', textHover: 'hover:text-blue-800', badge: 'bg-blue-100 text-blue-800' },
  },
  series: {
    title: '시리즈 관리',
    titleSingle: '시리즈',
    tableName: 'series',
    basePath: '/admin/series',
    icon: '/icons/admin/tv.svg',
    itemUnit: '시리즈',
    searchPlaceholder: '시리즈 이름 검색...',
    color: { primary: '#10B981', bgSolid: '#10B981', bgSolidHover: '#059669', text: 'text-green-600', textHover: 'hover:text-green-800', badge: 'bg-green-100 text-green-800' },
  },
  mobileSuits: {
    title: '모빌슈트 관리',
    titleSingle: '모빌슈트',
    tableName: 'mobile_suits',
    basePath: '/admin/mobile-suits',
    icon: '/icons/admin/robot.svg',
    itemUnit: 'MS',
    searchPlaceholder: '모빌슈트 이름, 형식번호 검색...',
    color: { primary: '#8B5CF6', bgSolid: '#8B5CF6', bgSolidHover: '#7C3AED', text: 'text-purple-600', textHover: 'hover:text-purple-800', badge: 'bg-purple-100 text-purple-800' },
  },
  pilots: {
    title: '파일럿 관리',
    titleSingle: '파일럿',
    tableName: 'pilots',
    basePath: '/admin/pilots',
    icon: '/icons/admin/user.svg',
    itemUnit: '파일럿',
    searchPlaceholder: '파일럿 이름 검색...',
    color: { primary: '#F59E0B', bgSolid: '#F59E0B', bgSolidHover: '#D97706', text: 'text-amber-600', textHover: 'hover:text-amber-800', badge: 'bg-amber-100 text-amber-800' },
  },
  factions: {
    title: '진영 관리',
    titleSingle: '진영',
    tableName: 'factions',
    basePath: '/admin/factions',
    icon: '/icons/admin/flag.svg',
    itemUnit: '진영',
    searchPlaceholder: '진영 이름 검색...',
    color: { primary: '#EF4444', bgSolid: '#EF4444', bgSolidHover: '#DC2626', text: 'text-red-600', textHover: 'hover:text-red-800', badge: 'bg-red-100 text-red-800' },
  },
  organizations: {
    title: '조직 관리',
    titleSingle: '조직',
    tableName: 'organizations',
    basePath: '/admin/organizations',
    icon: '/icons/admin/factory.svg',
    itemUnit: '조직',
    searchPlaceholder: '조직명 또는 ID 검색...',
    color: { primary: '#8B5CF6', bgSolid: '#8B5CF6', bgSolidHover: '#7C3AED', text: 'text-purple-600', textHover: 'hover:text-purple-800', badge: 'bg-purple-100 text-purple-800' },
  },
  // 레거시 호환용 (path 유지)
  companies: {
    title: '기업 관리',
    titleSingle: '기업',
    tableName: 'companies',
    basePath: '/admin/companies',
    icon: '/icons/admin/factory.svg',
    itemUnit: '기업',
    searchPlaceholder: '기업 이름 검색...',
    color: { primary: '#6366F1', bgSolid: '#6366F1', bgSolidHover: '#4F46E5', text: 'text-indigo-600', textHover: 'hover:text-indigo-800', badge: 'bg-indigo-100 text-indigo-800' },
  },
}

// ============================================
// V1.9: 조직 유형 (org_type)
// ============================================
export const ORG_TYPES: { code: OrgType; name: string; color: string; description: string }[] = [
  { code: 'MILITARY', name: '군사조직', color: 'blue', description: '공식 군대 (지구연방군, 자프트 등)' },
  { code: 'PARAMILITARY', name: '준군사조직', color: 'green', description: '반군, 특수부대, 레지스탕스 (에우고, 솔레스탈 비잉 등)' },
  { code: 'CORPORATE', name: '기업', color: 'purple', description: '기업, 재단, 연구기관 (애너하임, 모르겐뢰테 등)' },
  { code: 'CIVIL', name: '민간/정치', color: 'yellow', description: '정부, 의회, 귀족가문' },
  { code: 'OTHER', name: '기타', color: 'gray', description: '기타 조직' },
]

// ============================================
// V1.9: MS 관계 유형 (relationship_type)
// ============================================
export const MS_RELATIONSHIP_TYPES: { code: MsRelationshipType; name: string; description: string }[] = [
  { code: 'operated_by', name: '운용', description: '실제로 운용한 조직' },
  { code: 'developed_by', name: '개발', description: '설계/개발한 조직' },
  { code: 'manufactured_by', name: '제조', description: '생산/제조한 조직' },
  { code: 'supplied_by', name: '공급', description: '공급/납품한 조직' },
  { code: 'captured_by', name: '노획', description: '노획/탈취한 조직' },
  { code: 'owned_by', name: '소유', description: '소유권을 가진 조직' },
]

// ============================================
// 타임라인/Universe 코드
// ============================================
export const UNIVERSE_CODES = [
  { code: 'UC', name: '우주세기', color: '#1E40AF' },
  { code: 'CE', name: '코즈믹 이라', color: '#DC2626' },
  { code: 'AD', name: '서력', color: '#9333EA' },
  { code: 'PD', name: '포스트 디재스터', color: '#CA8A04' },
  { code: 'AS', name: '애드 스텔라', color: '#16A34A' },
  { code: 'AC', name: '애프터 콜로니', color: '#0891B2' },
  { code: 'FC', name: '미래세기', color: '#DB2777' },
  { code: 'AG', name: '어드밴스드 제네레이션', color: '#EA580C' },
  { code: 'AW', name: '애프터 워', color: '#7C3AED' },
  { code: 'CC', name: '코렉트 센츄리', color: '#059669' },
  { code: 'RC', name: '리길드 센츄리', color: '#D97706' },
  { code: 'BD', name: '빌드', color: '#F97316' },
  { code: 'OT', name: '기타', color: '#6B7280' },
]

// ============================================
// 뱃지 색상 매핑
// ============================================
export const BADGE_COLORS: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800',
  red: 'bg-red-100 text-red-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
  orange: 'bg-orange-100 text-orange-800',
  gray: 'bg-gray-100 text-gray-800',
  navy: 'bg-indigo-100 text-indigo-800',
  gold: 'bg-amber-100 text-amber-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  cyan: 'bg-cyan-100 text-cyan-800',
  teal: 'bg-teal-100 text-teal-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-800',
  rose: 'bg-rose-100 text-rose-800',
  violet: 'bg-violet-100 text-violet-800',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-800',
}

// ============================================
// 헬퍼 함수
// ============================================

// org_type에 대한 뱃지 스타일 반환
export function getOrgTypeBadge(orgType: OrgType): string {
  const type = ORG_TYPES.find(t => t.code === orgType)
  return type ? BADGE_COLORS[type.color] || BADGE_COLORS.gray : BADGE_COLORS.gray
}

// org_type 이름 반환
export function getOrgTypeName(orgType: OrgType): string {
  const type = ORG_TYPES.find(t => t.code === orgType)
  return type?.name || orgType
}

// relationship_type 이름 반환
export function getRelationshipTypeName(relType: MsRelationshipType): string {
  const type = MS_RELATIONSHIP_TYPES.find(t => t.code === relType)
  return type?.name || relType
}

// Universe 코드로 이름 반환
export function getUniverseName(code: string): string {
  const universe = UNIVERSE_CODES.find(u => u.code === code)
  return universe?.name || code
}

// Universe 코드로 색상 반환
export function getUniverseColor(code: string): string {
  const universe = UNIVERSE_CODES.find(u => u.code === code)
  return universe?.color || '#6B7280'
}

// 색상 문자열로 뱃지 클래스 반환
export function getBadgeClass(color: string | null): string {
  if (!color) return BADGE_COLORS.gray
  
  // HEX 색상이면 기본값 반환
  if (color.startsWith('#')) return BADGE_COLORS.gray
  
  // 색상 이름으로 매칭
  return BADGE_COLORS[color.toLowerCase()] || BADGE_COLORS.gray
}

// ============================================
// 레거시 호환 (기존 페이지들이 사용하던 상수)
// ============================================

// UNIVERSES → UNIVERSE_CODES 별칭
export const UNIVERSES = UNIVERSE_CODES

// FACTION_BADGE_COLORS → BADGE_COLORS 별칭
export const FACTION_BADGE_COLORS = BADGE_COLORS

// PILOT_ROLES (기존 pilots 페이지용)
export const PILOT_ROLES = [
  { code: 'pilot', name: '파일럿', color: 'blue' },
  { code: 'ace', name: '에이스', color: 'purple' },
  { code: 'newtype', name: '뉴타입', color: 'green' },
  { code: 'coordinator', name: '코디네이터', color: 'red' },
  { code: 'innovator', name: '이노베이터', color: 'gold' },
  { code: 'cyber_newtype', name: '강화인간', color: 'orange' },
  { code: 'oldtype', name: '올드타입', color: 'gray' },
  { code: 'commander', name: '지휘관', color: 'navy' },
  { code: 'test_pilot', name: '테스트 파일럿', color: 'teal' },
  { code: 'civilian', name: '민간인', color: 'gray' },
  { code: 'other', name: '기타', color: 'gray' },
]

// COMPANY_TYPES (레거시)
export const COMPANY_TYPES = [
  { code: 'manufacturer', name: '제조사', color: 'blue' },
  { code: 'research', name: '연구기관', color: 'purple' },
  { code: 'conglomerate', name: '복합기업', color: 'green' },
  { code: 'military_org', name: '군사조직', color: 'red' },
  { code: 'other', name: '기타', color: 'gray' },
]

// MS_TYPES (레거시 - 필요시)
export const MS_TYPES = [
  { code: 'mobile_suit', name: '모빌슈트', color: 'blue' },
  { code: 'mobile_armor', name: '모빌아머', color: 'red' },
  { code: 'mobile_pod', name: '모빌포드', color: 'green' },
  { code: 'mobile_worker', name: '모빌워커', color: 'orange' },
  { code: 'support_unit', name: '지원기', color: 'purple' },
  { code: 'other', name: '기타', color: 'gray' },
]
