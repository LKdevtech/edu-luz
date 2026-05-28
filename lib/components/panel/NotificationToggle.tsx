'use client'

import { useTransition, useState } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Enums } from '@/lib/types/database.types'

type NotificationToggleProps = {
  studentId: string
  notifType: Enums<'notification_type'>
  initialPush: boolean
  initialEmail: boolean
  label: string
  description: string
}

/**
 * Toggle powiadomień push dla ucznia (panel profile, sekcja 7.3).
 * W panelu ucznia widoczny jest tylko push (nie email).
 */
export function NotificationToggle({
  studentId,
  notifType,
  initialPush,
  initialEmail,
  label,
  description,
}: NotificationToggleProps) {
  const [pushOn, setPushOn] = useState(initialPush)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const next = !pushOn
    setPushOn(next)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from('notification_preferences').upsert(
        {
          profile_id: studentId,
          notif_type: notifType,
          push_enabled: next,
          email_enabled: initialEmail,
        },
        { onConflict: 'profile_id,notif_type' },
      )
      if (error) {
        setPushOn(!next)
        console.error('Notification toggle failed:', error)
      }
    })
  }

  return (
    <div className="flex items-center justify-between border-b border-subtle py-3 last:border-b-0">
      <div className="min-w-0 flex-1 pr-3">
        <div className="text-[12px] font-bold text-primary">{label}</div>
        <div className="text-[11px] text-dim">{description}</div>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        role="switch"
        aria-checked={pushOn}
        aria-label={label}
        className="relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-60"
        style={{
          backgroundColor: pushOn ? '#3B8FF0' : '#1C2035',
          border: pushOn ? 'none' : '1px solid rgba(59,143,240,0.10)',
        }}
      >
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition-all"
          style={{ left: pushOn ? '19px' : '2px' }}
        />
      </button>
    </div>
  )
}
