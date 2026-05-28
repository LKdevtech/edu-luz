'use client'

import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Enums } from '@/lib/types/database.types'

type ParentNotificationRowProps = {
  parentId: string
  notifType: Enums<'notification_type'>
  initialEmail: boolean
  initialPush: boolean
  label: string
  description: string
  /**
   * Jeśli true: nie można wyłączyć ostatniego aktywnego kanału.
   * Używane dla 3 przypomnień płatności (sekcja 3.4 SYSTEM_INSTRUCTIONS_v2).
   */
  requireAtLeastOne?: boolean
}

/**
 * Wiersz powiadomienia rodzica: 2 toggle'e (Email + Push).
 * Layout: label/desc po lewej, dwa toggle po prawej.
 */
export function ParentNotificationRow({
  parentId,
  notifType,
  initialEmail,
  initialPush,
  label,
  description,
  requireAtLeastOne = false,
}: ParentNotificationRowProps) {
  const [email, setEmail] = useState(initialEmail)
  const [push, setPush] = useState(initialPush)
  const [isPending, startTransition] = useTransition()

  function persist(nextEmail: boolean, nextPush: boolean) {
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from('notification_preferences').upsert(
        {
          profile_id: parentId,
          notif_type: notifType,
          email_enabled: nextEmail,
          push_enabled: nextPush,
        },
        { onConflict: 'profile_id,notif_type' },
      )
      if (error) {
        // rollback
        setEmail(!nextEmail === email ? email : !nextEmail)
        setPush(!nextPush === push ? push : !nextPush)
        console.error('Notification toggle failed:', error)
      }
    })
  }

  function toggleEmail() {
    const next = !email
    // Blokada: jeśli requireAtLeastOne i wyłączam ostatni kanał — anuluj.
    if (requireAtLeastOne && !next && !push) return
    setEmail(next)
    persist(next, push)
  }

  function togglePush() {
    const next = !push
    if (requireAtLeastOne && !next && !email) return
    setPush(next)
    persist(email, next)
  }

  const lastEmailOn = requireAtLeastOne && email && !push
  const lastPushOn = requireAtLeastOne && push && !email

  return (
    <div className="flex items-center justify-between gap-3 border-b border-subtle py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-bold text-primary">{label}</div>
        <div className="text-[11px] text-dim">{description}</div>
      </div>
      <div className="flex items-center gap-4">
        <ToggleSwitch
          on={email}
          onToggle={toggleEmail}
          disabled={isPending || lastEmailOn}
          label="Email"
        />
        <ToggleSwitch
          on={push}
          onToggle={togglePush}
          disabled={isPending || lastPushOn}
          label="Push"
        />
      </div>
    </div>
  )
}

function ToggleSwitch({
  on,
  onToggle,
  disabled,
  label,
}: {
  on: boolean
  onToggle: () => void
  disabled: boolean
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        role="switch"
        aria-checked={on}
        aria-label={label}
        className="relative h-5 w-9 rounded-full transition-colors disabled:opacity-40"
        style={{
          backgroundColor: on ? '#3B8FF0' : '#1C2035',
          border: on ? 'none' : '1px solid rgba(59,143,240,0.10)',
        }}
      >
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition-all"
          style={{ left: on ? '19px' : '2px' }}
        />
      </button>
      <span className="text-[9px] font-bold uppercase tracking-wider text-dim">{label}</span>
    </div>
  )
}
