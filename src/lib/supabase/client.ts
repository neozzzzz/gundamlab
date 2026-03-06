// src/lib/supabase/client.ts
// 브라우저(클라이언트)에서 사용하는 Supabase 클라이언트
// Next.js 15+ 호환 - @supabase/ssr 사용

import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 편의를 위한 싱글톤 인스턴스
export const supabase = createClient()
