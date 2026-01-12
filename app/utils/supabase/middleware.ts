import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 2. Update the RESPONSE cookies (Safe)
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Refresh the Session
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Protected Routes Logic
  // Allow these paths (Dashboard, Inventory, etc.)
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/inventory') ||
      request.nextUrl.pathname.startsWith('/sales-entry') ||
      request.nextUrl.pathname.startsWith('/reports')) {
      
      // If NOT logged in, kick out
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/signin'
        return NextResponse.redirect(url)
      }
  }

  // 5. Auth Page Logic
  // If LOGGED IN and trying to visit Sign In/Up
  if (request.nextUrl.pathname.startsWith('/auth') && user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
  }

  return response
}