import { type ReactNode } from 'react'

import { getNotifications, getUnreadCount } from '@/lib/queries/notifications'
import { createSupabaseServerClient } from '@/lib/supabase/server'

import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export type PanelNavItem = {
  href: string
  label: string
  icon: string
  /** Liczba widoczna w czerwonym badge'u (np. liczba zaległości). 0 lub undefined = brak badge'u. */
  badgeCount?: number
}

export type PanelRoleBadge = {
  label: string
  color: string
  bgClass: string
  textClass: string
}

type PanelLayoutProps = {
  navItems: PanelNavItem[]
  roleBadge: PanelRoleBadge
  greeting: string
  userName: string
  userInitials: string
  userAvatarColor: string
  /** Profile.id zalogowanego użytkownika — do pobrania jego powiadomień. */
  userId: string
  children: ReactNode
}

export async function PanelLayout({
  navItems,
  roleBadge,
  greeting,
  userName,
  userInitials,
  userAvatarColor,
  userId,
  children,
}: PanelLayoutProps) {
  const supabase = createSupabaseServerClient()
  const [unreadCount, notifications] = await Promise.all([
    getUnreadCount(supabase, userId),
    getNotifications(supabase, userId, 20),
  ])

  return (
    <div className="flex h-screen overflow-hidden bg-main">
      <Sidebar navItems={navItems} roleBadge={roleBadge} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          greeting={greeting}
          userName={userName}
          userInitials={userInitials}
          userAvatarColor={userAvatarColor}
          userId={userId}
          unreadCount={unreadCount}
          notifications={notifications}
        />
        <main className="flex-1 overflow-y-auto px-6 pb-10 pt-5">{children}</main>
      </div>
    </div>
  )
}
