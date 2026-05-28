'use client'

import { useTransition, useState } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type HomeworkCheckboxProps = {
  homeworkId: string
  studentId: string
  initialDone: boolean
}

/**
 * Checkbox PD — jedyna mutacja dostępna dla roli `student` (sekcja 9 widoczności).
 * Aktualizuje `homework_completions.is_done` przez upsert.
 */
export function HomeworkCheckbox({
  homeworkId,
  studentId,
  initialDone,
}: HomeworkCheckboxProps) {
  const [done, setDone] = useState(initialDone)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const next = !done
    setDone(next) // optymistycznie
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from('homework_completions').upsert(
        {
          homework_id: homeworkId,
          student_id: studentId,
          is_done: next,
          done_at: next ? new Date().toISOString() : null,
        },
        { onConflict: 'homework_id,student_id' },
      )
      if (error) {
        // Rollback przy błędzie.
        setDone(!next)
        console.error('Homework toggle failed:', error)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-checked={done}
      role="checkbox"
      aria-label={done ? 'Oznacz jako niewykonane' : 'Oznacz jako wykonane'}
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors disabled:opacity-60"
      style={{
        borderColor: done ? '#22C55E60' : '#FFCA2860',
        backgroundColor: done ? '#22C55E22' : 'transparent',
        color: '#22C55E',
      }}
    >
      {done ? '✓' : ''}
    </button>
  )
}
