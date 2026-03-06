'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { AuthButton } from './auth-button'

export function GNB() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()

  // admin 페이지에서는 GNB 숨김
  if (pathname?.startsWith('/admin')) return null

  const navItems = [
    { href: '/', label: '홈' },
    { href: '/kits', label: '모델 목록' },
  ]

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href))

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity">
              GUNDAM ARCHIVE
            </Link>
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-lg font-bold ${
                  isActive(href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground transition-colors'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="hidden md:block">
            <AuthButton />
          </div>

          {/* 모바일 로고 */}
          <Link href="/" className="md:hidden text-2xl font-bold text-gradient hover:opacity-80 transition-opacity">
            GUNDAM ARCHIVE
          </Link>

          {/* 모바일: 아바타 + 햄버거 */}
          <div className="md:hidden flex items-center gap-3">
            {user?.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.name || 'User'}
                className="w-8 h-8 rounded-full"
              />
            )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative flex justify-center items-center w-8 h-8"
            aria-label="메뉴"
          >
            <span className={`absolute block w-5 h-0.5 bg-foreground transition-all duration-300 ${menuOpen ? 'rotate-45' : '-translate-y-[6px]'}`} />
            <span className={`absolute block w-5 h-0.5 bg-foreground transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`absolute block w-5 h-0.5 bg-foreground transition-all duration-300 ${menuOpen ? '-rotate-45' : 'translate-y-[6px]'}`} />
          </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {menuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-border flex items-center justify-between pl-4">
            <div className="flex items-center gap-4">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-lg font-bold ${
                    isActive(href)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground transition-colors'
                  }`
                  }
                >
                  {label}
                </Link>
              ))}

            </div>
            <AuthButton />
          </nav>
        )}
      </div>
    </header>
  )
}
