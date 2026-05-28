'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import {
  markAllAsRead,
  markAsRead,
  type NotificationRow,
  type NotificationType,
} from '@/lib/queries/notifications'

type NotificationBellProps = {
  userId: string
  unreadCount: number
  notifications: NotificationRow[]
}

const TYPE_META: Record<NotificationType, { icon: string; color: string }> = {
  lesson_change: { icon: '📅', color: '#3B8FF0' },
  payment_reminder: { icon: '💳', color: '#FFCA28' },
  absence: { icon: '⚠️', color: '#EF4444' },
  entry_added: { icon: '📝', color: '#22C55E' },
  admin_message: { icon: '📢', color: '#7C5CFC' },
}

export function NotificationBell({ userId, unreadCount, notifications }: NotificationBellProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const wrapRef = useRef<HTMLDivElement>(null)

  // Zamknij dropdown przy kliknięciu poza komponentem.
  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  function handleMarkOne(id: string, alreadyRead: boolean) {
    if (alreadyRead) return
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      await markAsRead(supabase, id)
      router.refresh()
    })
  }

  function handleMarkAll() {
    if (unreadCount === 0) return
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      await markAllAsRead(supabase, userId)
      router.refresh()
    })
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-label="Powiadomienia"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface text-[15px] text-secondary hover:bg-surface-hover hover:text-primary"
      >
        🔔
        {unreadCount > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-extrabold text-white"
            style={{ backgroundColor: '#EF4444' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-[14px] bg-surface"
          style={{ border: '1px solid rgba(59,143,240,0.20)', boxShadow: '0 12px 32px rgba(0,0,0,0.45)' }}
        >
          <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-extrabold text-primary">Powiadomienia</span>
              {unreadCount > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-[11px] font-bold text-link hover:underline"
              >
                Oznacz wszystkie jako przeczytane
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-dim">
                🔕 Brak powiadomień.
              </div>
            ) : (
              notifications.map((n) => {
                const meta = TYPE_META[n.type]
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleMarkOne(n.id, n.read)}
                    className="flex w-full items-start gap-3 border-b border-subtle px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                    style={{ backgroundColor: n.read ? 'transparent' : 'rgba(59,143,240,0.06)' }}
                  >
                    <span
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-[13px]"
                      style={{ backgroundColor: `${meta.color}1F` }}
                      aria-hidden
                    >
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!n.read && (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: '#3B8FF0' }}
                            aria-hidden
                          />
                        )}
                        <span
                          className={`truncate text-[12px] ${n.read ? 'font-semibold text-secondary' : 'font-extrabold text-primary'}`}
                        >
                          {n.title}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-dim">{n.message}</p>
                      <p className="mt-1 text-[10px] text-dim">{formatRelative(n.createdAt)}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function formatRelative(iso: string): string {
  const then = new Date(iso)
  const diffMs = Date.now() - then.getTime()
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return 'przed chwilą'
  if (min < 60) return `${min} min temu`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} godz. temu`
  const days = Math.floor(h / 24)
  if (days === 1) return 'wczoraj'
  if (days < 7) return `${days} dni temu`
  return then.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
