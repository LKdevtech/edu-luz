type TopbarProps = {
  greeting: string
  userName: string
  userInitials: string
  userAvatarColor: string
}

export function Topbar({ greeting, userName, userInitials, userAvatarColor }: TopbarProps) {
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
        <button
          type="button"
          aria-label="Powiadomienia"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface text-[15px] text-secondary hover:bg-surface-hover hover:text-primary"
        >
          🔔
        </button>
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
