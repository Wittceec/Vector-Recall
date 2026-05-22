import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // update user's auth session
  const { supabaseResponse, user } = await updateSession(request)

  const url = request.nextUrl
  
  // Example of protecting all routes except for /login and /auth/*
  const isAuthRoute = url.pathname === '/login' || url.pathname.startsWith('/auth')
  const isApiRoute = url.pathname.startsWith('/api')
  const isNextInternal = url.pathname.startsWith('/_next')
  const isPublicFile = /\.(.*)$/.test(url.pathname)

  if (isAuthRoute || isApiRoute || isNextInternal || isPublicFile) {
    return supabaseResponse
  }

  if (!user) {
    return Response.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
