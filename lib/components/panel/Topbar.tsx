import { NotificationBell } from './NotificationBell'
import type { NotificationRow } from '@/lib/queries/notifications'

type TopbarProps = {
  greeting: string
  userName: string
  userInitials: string
  userAvatarColor: string
  userId: string
  unreadCount: number
  notifications: NotificationRow[]
}

export function Topbar({
  greeting,
  userName,
  userInitials,
  userAvatarColor,
  userId,
  unreadCount,
  notifications,
}: TopbarProps) {
  const today = new Date().toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-subtle bg-alt px-6">
      <div className="flex items-baseline gap-3">
        <span className="text-[14px] text-primary">
          {greeting}, <span className="font-extrabold">{userName}</span>
        </span>
        <span className="text-[11px] text-dim">{today}</span>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell userId={userId} unreadCount={unreadCount} notifications={notifications} />
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-extrabold"
          style={{ backgroundColor: `${userAvatarColor}22`, color: userAvatarColor }}
        >
          {userInitials}
        </div>
      </div>
    </header>
  )
}
