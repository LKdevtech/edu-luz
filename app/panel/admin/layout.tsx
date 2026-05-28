import { type ReactNode } from 'react'

import { PanelLayout, type PanelNavItem, type PanelRoleBadge } from '@/lib/components/panel/PanelLayout'
import { getCurrentAdminId } from '@/lib/auth/getCurrentAdminId'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getAvatarColor, getInitials } from '@/lib/queries/_helpers'

const ROLE_BADGE: PanelRoleBadge = {
  label: 'ADMIN',
  color: '#7C5CFC',
  bgClass: 'bg-[#7C5CFC22]',
  textClass: 'text-accent',
}

const NAV: PanelNavItem[] = [
  { href: '/panel/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/panel/admin/schedule', label: 'Harmonogram', icon: '📅' },
  { href: '/panel/admin/tutors', label: 'Korepetytorzy', icon: '👨‍🏫' },
  { href: '/panel/admin/lessons', label: 'Dziennik wpisów', icon: '📝' },
  { href: '/panel/admin/students', label: 'Uczniowie i grupy', icon: '👥' },
  { href: '/panel/admin/payments', label: 'Płatności', icon: '💳' },
  { href: '/panel/admin/settings', label: 'Ustawienia', icon: '⚙' },
]

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const adminId = await getCurrentAdminId()
  const supabase = createSupabaseServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', adminId)
    .single()

  const firstName = profile?.first_name ?? ''
  const lastName = profile?.last_name ?? ''

  return (
    <PanelLayout
      navItems={NAV}
      roleBadge={ROLE_BADGE}
      greeting="Dzień dobry"
      userName={firstName}
      userInitials={getInitials(firstName, lastName)}
      userAvatarColor={getAvatarColor(`${firstName} ${lastName}`)}
    >
      {children}
    </PanelLayout>
  )
}
