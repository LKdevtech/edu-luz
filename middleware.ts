import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import type { Database } from '@/lib/types/database.types'

// Middleware ochrony paneli. Działa TYLKO na /panel/* i /login (patrz `config`).
// Edge runtime: używamy wyłącznie @supabase/ssr + cookies z request/response,
// bez next/headers ani niczego z Node.js runtime.

const PANEL_ROLES = ['admin', 'tutor', 'parent', 'student'] as const
type PanelRole = (typeof PANEL_ROLES)[number]

const DASHBOARD: Record<PanelRole, string> = {
  admin: '/panel/admin/dashboard',
  tutor: '/panel/tutor/dashboard',
  parent: '/panel/parent/dashboard',
  student: '/panel/student/dashboard',
}

function isPanelRole(value: unknown): value is PanelRole {
  return typeof value === 'string' && (PANEL_ROLES as readonly string[]).includes(value)
}

// Segment URL /panel/<rola>/... → rola wymagana dla tej ścieżki.
function requiredRoleFor(pathname: string): PanelRole | undefined {
  const segment = pathname.split('/')[2]
  return isPanelRole(segment) ? segment : undefined
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Przekierowanie z zachowaniem odświeżonych cookies sesji (refresh tokenu
  // mógł je podmienić w `setAll`). new URL(path, base) usuwa stare query.
  function redirect(path: string) {
    const res = NextResponse.redirect(new URL(path, request.url))
    response.cookies.getAll().forEach((cookie) => res.cookies.set(cookie))
    return res
  }

  // Rola: najpierw z user_metadata (zero zapytań do bazy), potem fallback
  // do tabeli profiles dla kont bez roli w metadanych.
  async function resolveRole(): Promise<PanelRole | undefined> {
    const metaRole = user?.user_metadata?.role
    if (isPanelRole(metaRole)) return metaRole
    if (!user) return undefined
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const dbRole = data?.role
    return isPanelRole(dbRole) ? dbRole : undefined
  }

  const { pathname } = request.nextUrl

  // /login — zalogowany użytkownik trafia od razu na swój panel.
  if (pathname === '/login') {
    if (user) {
      const role = await resolveRole()
      if (role) return redirect(DASHBOARD[role])
    }
    return response
  }

  // /panel/* — wymaga sesji.
  if (!user) {
    return redirect('/login')
  }

  // Sesja bez znanej roli — bezpiecznie z powrotem na /login.
  const role = await resolveRole()
  if (!role) {
    return redirect('/login')
  }

  // Zła rola dla danego segmentu → na właściwy panel tej roli.
  const required = requiredRoleFor(pathname)
  if (required && required !== role) {
    return redirect(DASHBOARD[role])
  }

  return response
}

export const config = {
  matcher: ['/panel/:path*', '/login'],
}
