import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ADMIN_LOGIN_PATH = '/admin/login'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const requestHeaders = await headers()
  const nextUrl = requestHeaders.get('next-url') ?? requestHeaders.get('x-pathname') ?? ''
  const isLoginPage = nextUrl.startsWith(ADMIN_LOGIN_PATH)

  if (isLoginPage) {
    return <>{children}</>
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect(ADMIN_LOGIN_PATH)
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as any)?.role

  if (profileError || role !== 'admin') {
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch {
      // No-op: redirect is enough when logout fails.
    }
    redirect(ADMIN_LOGIN_PATH)
  }

  return <>{children}</>
}
