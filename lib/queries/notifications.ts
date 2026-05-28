import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/types/database.types'

// UWAGA: ten moduł NIE jest 'server-only' — funkcje przyjmują klienta Supabase,
// więc działają zarówno po stronie serwera (RSC, klient serwerowy) jak i klienta
// (dzwonek wykonuje mark-as-read przez klienta przeglądarkowego).

type Supabase = SupabaseClient<Database>

export type NotificationType =
  | 'lesson_change'
  | 'payment_reminder'
  | 'absence'
  | 'entry_added'
  | 'admin_message'

export type NotificationRow = {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

/** Liczba nieprzeczytanych powiadomień użytkownika (do badge'a). */
export async function getUnreadCount(supabase: Supabase, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)
  if (error) throw error
  return count ?? 0
}

/**
 * Powiadomienia użytkownika — nieprzeczytane na górze, potem najnowsze.
 * (read asc: false<true, więc nieprzeczytane pierwsze; created_at desc.)
 */
export async function getNotifications(
  supabase: Supabase,
  userId: string,
  limit = 20,
): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, read, created_at')
    .eq('user_id', userId)
    .order('read', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map((n) => ({
    id: n.id,
    type: n.type as NotificationType,
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: n.created_at,
  }))
}

/** Oznacz jedno powiadomienie jako przeczytane. */
export async function markAsRead(supabase: Supabase, notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
  if (error) throw error
}

/** Oznacz wszystkie nieprzeczytane powiadomienia użytkownika jako przeczytane. */
export async function markAllAsRead(supabase: Supabase, userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
  if (error) throw error
}
