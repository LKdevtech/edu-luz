import { renderToBuffer } from '@react-pdf/renderer'
import { type NextRequest, NextResponse } from 'next/server'

import { getTutorMonthlyHours } from '@/lib/queries/admin'
import { TutorRegistryDocument } from '@/lib/pdf/TutorRegistryDocument'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/registry/[tutorId]/[month]
 *   month format: YYYY-MM (np. 2026-05)
 *
 * Zwraca PDF "Rejestr godzin realizacji zlecenia" dla danego korepetytora i miesiąca.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { tutorId: string; month: string } },
) {
  const { tutorId, month } = params
  const m = /^(\d{4})-(\d{2})$/.exec(month)
  if (!m) {
    return NextResponse.json(
      { error: 'Niepoprawny format miesiąca (oczekiwano YYYY-MM).' },
      { status: 400 },
    )
  }
  const year = Number(m[1])
  const monthNumber = Number(m[2])

  const supabase = createSupabaseServerClient()
  const [data, center] = await Promise.all([
    getTutorMonthlyHours(supabase, tutorId, year, monthNumber),
    supabase.from('center_settings').select('name').eq('id', 1).single(),
  ])

  if (center.error) {
    return NextResponse.json({ error: center.error.message }, { status: 500 })
  }

  const contractNumber = `UZ/${year}/${tutorId.slice(0, 8).toUpperCase()}`
  const centerName = center.data.name

  const buffer = await renderToBuffer(
    TutorRegistryDocument({ data, contractNumber, centerName }),
  )

  const filename = `rejestr-godzin-${slugify(data.tutorFullName)}-${year}-${String(monthNumber).padStart(2, '0')}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
