import { type ReactNode } from 'react'

import { PanelLayout, type PanelNavItem, type PanelRoleBadge } from '@/lib/components/panel/PanelLayout'
import { getCurrentTutorId } from '@/lib/auth/getCurrentTutorId'
import { getTutorPendingMakeupCount } from '@/lib/queries/tutor'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getAvatarColor, getInitials } from '@/lib/queries/_helpers'

const ROLE_BADGE: PanelRoleBadge = {
  label: 'KOREPETYTOR',
  color: '#3B8FF0',
  bgClass: 'bg-[rgba(59,143,240,0.16)]',
  textClass: 'text-link',
}

export default async function TutorPanelLayout({ children }: { children: ReactNode }) {
  const tutorId = await getCurrentTutorId()
  const supabase = createSupabaseServerClient()
  const [{ data: profile }, makeupCount] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name').eq('id', tutorId).single(),
    getTutorPendingMakeupCount(supabase, tutorId),
  ])

  const firstName = profile?.first_name ?? ''
  const lastName = profile?.last_name ?? ''

  const navItems: PanelNavItem[] = [
    { href: '/panel/tutor/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/panel/tutor/schedule', label: 'Harmonogram', icon: '📅' },
    { href: '/panel/tutor/students', label: 'Uczniowie', icon: '👥' },
    { href: '/panel/tutor/lessons', label: 'Dziennik wpisów', icon: '📝' },
    { href: '/panel/tutor/makeup', label: 'Odrabianie', icon: '🔄', badgeCount: makeupCount },
    { href: '/panel/tutor/availability', label: 'Dostępność', icon: '🕐' },
  ]

  return (
    <PanelLayout
      navItems={navItems}
      roleBadge={ROLE_BADGE}
      greeting="Cześć"
      userName={firstName}
      userInitials={getInitials(firstName, lastName)}
      userAvatarColor={getAvatarColor(`${firstName} ${lastName}`)}
      userId={tutorId}
    >
      {children}
    </PanelLayout>
  )
}
