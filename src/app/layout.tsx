// src/app/layout.tsx
// 루트 레이아웃 - Threads 스타일 다크모드

import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import { GNB } from '@/components/gnb'
import './globals.css'
import { Analytics } from "@vercel/analytics/react"
import GoogleAnalytics from '@/components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'GUNDAM ARCHIVE - 건담 아카이브',
  description: '건담 모델 정보를 한눈에',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-black text-white antialiased">
        <Providers>
          <GNB />
          {children}
        </Providers>
        <Analytics />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
