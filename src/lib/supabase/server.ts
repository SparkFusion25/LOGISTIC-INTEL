import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { type CookieOptions } from '@supabase/ssr'

export function createSupabaseServerClient() {
  const cookieStore = cookies()
  const hdrs = headers()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set(name, value, options) } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set(name, '', { ...options, maxAge: 0 }) } catch {}
        },
      },
      global: { headers: { 'x-forwarded-host': hdrs.get('host') ?? '' } }
    }
  )
}

// Legacy export for compatibility
export const supabaseServer = createSupabaseServerClient
