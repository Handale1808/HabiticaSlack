import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = NextResponse.next()
  const supabase = createSupabaseMiddlewareClient(request, response)

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: profileRow } = await supabase
    .from('Users')
    .select('id')
    .eq('user_id', data.session.user.id)
    .single()

  const redirectTo = profileRow ? '/upload' : '/profile'
  const redirectResponse = NextResponse.redirect(new URL(redirectTo, request.url))

  // Forward session cookies set by the supabase client onto the redirect response
  response.cookies.getAll().forEach(({ name, value, ...rest }) => {
    redirectResponse.cookies.set(name, value, rest)
  })

  return redirectResponse
}
