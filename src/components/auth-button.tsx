// src/components/auth-button.tsx
// 로그인/로그아웃 버튼 컴포넌트

'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { useState } from 'react'

export function AuthButton() {
  const { user, loading, isAdmin, signInWithGoogle, signOut } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true)
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in failed:', error)
      alert('로그인에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
      alert('로그아웃에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-2 bg-secondary rounded-lg animate-pulse min-w-[80px]">
        <div className="h-4 w-16 mx-auto bg-muted-foreground/20 rounded"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {/* 사용자 프로필 */}
        <div className="hidden sm:flex items-center gap-2">
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata?.name || 'User'}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-foreground">
            {user.user_metadata?.name || user.email}
          </span>
          {isAdmin && (
            <Link href="/admin" className="px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors">
              Dashboard
            </Link>
          )}
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="btn-secondary min-w-[80px]"
        >
          {isSigningOut ? '로그아웃 중...' : '로그아웃'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isSigningIn}
      className="btn-primary min-w-[80px]"
    >
      {isSigningIn ? '로그인 중...' : '로그인'}
    </button>
  )
}
