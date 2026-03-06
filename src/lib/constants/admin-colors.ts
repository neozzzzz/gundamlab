// src/lib/constants/admin-colors.ts
// Admin 페이지 색상 통합 관리

export const ADMIN_COLORS = {
  // 킷 관리 - Blue
  kits: {
    primary: 'blue',
    text: 'text-blue-600',
    textHover: 'hover:text-blue-800',
    bg: 'bg-blue-100',
    bgHover: 'hover:bg-blue-200',
    bgSolid: 'bg-blue-600',
    bgSolidHover: 'hover:bg-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    stat: 'text-blue-600',
  },

  // 시리즈 관리 - Purple
  series: {
    primary: 'purple',
    text: 'text-purple-600',
    textHover: 'hover:text-purple-800',
    bg: 'bg-purple-100',
    bgHover: 'hover:bg-purple-200',
    bgSolid: 'bg-purple-600',
    bgSolidHover: 'hover:bg-purple-700',
    badge: 'bg-purple-100 text-purple-800',
    stat: 'text-purple-600',
  },

  // 모빌슈트 관리 - Orange
  mobileSuits: {
    primary: 'orange',
    text: 'text-orange-600',
    textHover: 'hover:text-orange-800',
    bg: 'bg-orange-100',
    bgHover: 'hover:bg-orange-200',
    bgSolid: 'bg-orange-600',
    bgSolidHover: 'hover:bg-orange-700',
    badge: 'bg-orange-100 text-orange-800',
    stat: 'text-orange-600',
  },

  // 파일럿 관리 - Green
  pilots: {
    primary: 'green',
    text: 'text-green-600',
    textHover: 'hover:text-green-800',
    bg: 'bg-green-100',
    bgHover: 'hover:bg-green-200',
    bgSolid: 'bg-green-600',
    bgSolidHover: 'hover:bg-green-700',
    badge: 'bg-green-100 text-green-800',
    stat: 'text-green-600',
  },

  // 진영 관리 - Red
  factions: {
    primary: 'red',
    text: 'text-red-600',
    textHover: 'hover:text-red-800',
    bg: 'bg-red-100',
    bgHover: 'hover:bg-red-200',
    bgSolid: 'bg-red-600',
    bgSolidHover: 'hover:bg-red-700',
    badge: 'bg-red-100 text-red-800',
    stat: 'text-red-600',
  },

  // 제조사 관리 - Indigo
  companies: {
    primary: 'indigo',
    text: 'text-indigo-600',
    textHover: 'hover:text-indigo-800',
    bg: 'bg-indigo-100',
    bgHover: 'hover:bg-indigo-200',
    bgSolid: 'bg-indigo-600',
    bgSolidHover: 'hover:bg-indigo-700',
    badge: 'bg-indigo-100 text-indigo-800',
    stat: 'text-indigo-600',
  },

  // 조직 관리 - Purple
  organizations: {
    primary: 'purple',
    text: 'text-purple-600',
    textHover: 'hover:text-purple-800',
    bg: 'bg-purple-100',
    bgHover: 'hover:bg-purple-200',
    bgSolid: 'bg-purple-600',
    bgSolidHover: 'hover:bg-purple-700',
    badge: 'bg-purple-100 text-purple-800',
    stat: 'text-purple-600',
  },
} as const

// 진영별 색상 (모빌슈트/파일럿 페이지에서 사용)
export const FACTION_COLORS: Record<string, string> = {
  'EFSF': 'bg-blue-500/20 text-blue-800',
  'ZEON': 'bg-red-500/20 text-red-800',
  'TITANS': 'bg-indigo-500/20 text-indigo-800',
  'AEUG': 'bg-green-500/20 text-green-800',
  'NEO_ZEON': 'bg-orange-500/20 text-orange-800',
  'PLANT': 'bg-green-500/20 text-green-800',
  'CB': 'bg-purple-500/20 text-purple-800',
  'DEFAULT': 'bg-gray-500/20 text-gray-800',
}

// 타입 정의
export type AdminColorKey = keyof typeof ADMIN_COLORS
export type ColorVariant = keyof typeof ADMIN_COLORS.kits
