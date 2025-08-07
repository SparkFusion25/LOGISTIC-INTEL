import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname
  const pathname = req.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/landing', '/pricing', '/test-admin']
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/public')

  // If accessing a protected route without a session, redirect to login
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', req.url)
    
    // Add the original URL as a redirect parameter
    if (pathname !== '/login') {
      redirectUrl.searchParams.set('redirectTo', pathname)
    }
    
    return NextResponse.redirect(redirectUrl)
  }

  // If logged in and trying to access login/signup, redirect to dashboard
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}