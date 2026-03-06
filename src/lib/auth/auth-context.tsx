// src/lib/auth/auth-context.tsx
// 인증 상태 관리 컨텍스트

'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadAdminRole = useCallback(async (userId: string | null | undefined) => {
    if (!userId) {
      setIsAdmin(false)
      return
    }

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      setIsAdmin(false)
      return
    }

    setIsAdmin(data?.role === 'admin')
  }, [supabase])

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      setLoading(false)
      loadAdminRole(nextUser?.id)
    })

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      await loadAdminRole(nextUser?.id)
    })

    return () => subscription.unsubscribe()
  }, [loadAdminRole, supabase])

  const signInWithGoogle = async () => {
    // 로그인 후 돌아올 경로를 localStorage에 저장
    localStorage.setItem('auth-redirect', window.location.pathname)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const signOut = async () => {
    // 먼저 user 상태 초기화
    setUser(null)
    setIsAdmin(false)
    
    try {
      // scope: 'local'로 시도
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      // 에러 발생해도 무시 - 로컬 상태는 이미 초기화됨
      console.log('SignOut API error (ignored):', error)
    }
    
    // 브라우저 스토리지 강제 삭제
    if (typeof window !== 'undefined') {
      // 로컬 스토리지
      const localKeys = Object.keys(localStorage)
      localKeys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
      
      // 세션 스토리지
      const sessionKeys = Object.keys(sessionStorage)
      sessionKeys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key)
        }
      })
      
      // 쿠키 삭제 (supabase 관련)
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
      
      // 현재 페이지에서 새로고침으로 초기화
      window.location.reload()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
