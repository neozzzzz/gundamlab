// src/lib/supabase/server.ts
// 서버(Server Component, API Route)에서 사용하는 Supabase 클라이언트
// Next.js 15+ 호환 - cookies()가 Promise를 반환하므로 async 함수 사용

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll은 Server Component에서 호출될 수 있음
            // 미들웨어에서 세션 갱신 시 무시 가능
          }
        },
      },
    }
  )
}
