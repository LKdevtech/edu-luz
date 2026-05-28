import { type ReactNode } from 'react'

import { PanelLayout, type PanelNavItem, type PanelRoleBadge } from '@/lib/components/panel/PanelLayout'
import { getCurrentStudentId } from '@/lib/auth/getCurrentStudentId'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getAvatarColor, getInitials } from '@/lib/queries/_helpers'

const NAV: PanelNavItem[] = [
  { href: '/panel/student/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/panel/student/classes', label: 'Zajęcia', icon: '📚' },
  { href: '/panel/student/profile', label: 'Profil', icon: '👤' },
]

const ROLE_BADGE: PanelRoleBadge = {
  label: 'UCZEŃ',
  color: '#06B6D4',
  bgClass: 'bg-[#06B6D418]',
  textClass: 'text-cyan',
}

export default async function StudentPanelLayout({ children }: { children: ReactNode }) {
  const studentId = await getCurrentStudentId()
  const supabase = createSupabaseServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', studentId)
    .single()

  const firstName = profile?.first_name ?? ''
  const lastName = profile?.last_name ?? ''

  return (
    <PanelLayout
      navItems={NAV}
      roleBadge={ROLE_BADGE}
      greeting="Cześć"
      userName={firstName}
      userInitials={getInitials(firstName, lastName)}
      userAvatarColor={getAvatarColor(`${firstName} ${lastName}`)}
    >
      {children}
    </PanelLayout>
  )
}
