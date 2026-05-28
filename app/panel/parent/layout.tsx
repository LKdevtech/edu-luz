import { type ReactNode } from 'react'

import { PanelLayout, type PanelNavItem, type PanelRoleBadge } from '@/lib/components/panel/PanelLayout'
import { getCurrentParentId } from '@/lib/auth/getCurrentParentId'
import { getParentOverdueBadgeCount } from '@/lib/queries/parent'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getAvatarColor, getInitials } from '@/lib/queries/_helpers'

const ROLE_BADGE: PanelRoleBadge = {
  label: 'RODZIC',
  color: '#7C5CFC',
  bgClass: 'bg-[#7C5CFC18]',
  textClass: 'text-accent',
}

export default async function ParentPanelLayout({ children }: { children: ReactNode }) {
  const parentId = await getCurrentParentId()
  const supabase = createSupabaseServerClient()
  const [{ data: profile }, overdueCount] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name').eq('id', parentId).single(),
    getParentOverdueBadgeCount(supabase, parentId),
  ])

  const firstName = profile?.first_name ?? ''
  const lastName = profile?.last_name ?? ''

  const navItems: PanelNavItem[] = [
    { href: '/panel/parent/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/panel/parent/classes', label: 'Zajęcia', icon: '📚' },
    {
      href: '/panel/parent/payments',
      label: 'Płatności',
      icon: '💳',
      badgeCount: overdueCount,
    },
    { href: '/panel/parent/profile', label: 'Profil', icon: '👤' },
  ]

  return (
    <PanelLayout
      navItems={navItems}
      roleBadge={ROLE_BADGE}
      greeting="Dzień dobry"
      userName={firstName}
      userInitials={getInitials(firstName, lastName)}
      userAvatarColor={getAvatarColor(`${firstName} ${lastName}`)}
      userId={parentId}
    >
      {children}
    </PanelLayout>
  )
}
