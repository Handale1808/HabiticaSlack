import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/supabaseServer'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createSupabaseMiddlewareClient(request, response)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/upload', '/lists/:path*', '/profile'],
}
