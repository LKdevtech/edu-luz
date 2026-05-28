'use client'

import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { HomeworkRow } from '@/lib/queries/student'
import { formatPolishDate } from '@/lib/utils/date'

import { SubjectDot } from './Badges'
import { HomeworkCheckbox } from './HomeworkCheckbox'

type HomeworkSectionProps = {
  homework: HomeworkRow[]
  studentId: string
}

/**
 * Klient-side sekcja PD na dashboardzie ucznia.
 *
 * Trzyma listę zadań w stanie lokalnym i sama dzieli ją na „Do zrobienia" /
 * „Zrobione" na podstawie aktualnego `isDone`. Toggle checkboxa:
 *   1. optymistycznie przełącza `isDone` w stanie → karta natychmiast przeskakuje
 *      do drugiej sekcji (lub wraca z „Zrobione" do „Do zrobienia" przy odznaczeniu);
 *   2. wykonuje upsert do `homework_completions`;
 *   3. w razie błędu cofa zmianę.
 */
export function HomeworkSection({ homework, studentId }: HomeworkSectionProps) {
  const [items, setItems] = useState<HomeworkRow[]>(homework)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()

  const pending = items
    .filter((h) => !h.isDone)
    .sort((a, b) => b.lessonDate.localeCompare(a.lessonDate))
  const done = items
    .filter((h) => h.isDone)
    .sort((a, b) => {
      // Najpierw najświeższe doneAt, fallback do lessonDate.
      const aKey = a.doneAt ?? a.lessonDate
      const bKey = b.doneAt ?? b.lessonDate
      return bKey.localeCompare(aKey)
    })
    .slice(0, 5)

  function toggle(homeworkId: string) {
    const current = items.find((h) => h.homeworkId === homeworkId)
    if (!current) return
    const next = !current.isDone
    const nowIso = new Date().toISOString()

    setItems((prev) =>
      prev.map((h) =>
        h.homeworkId === homeworkId
          ? { ...h, isDone: next, doneAt: next ? nowIso : null }
          : h,
      ),
    )
    setPendingIds((prev) => new Set(prev).add(homeworkId))

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from('homework_completions').upsert(
        {
          homework_id: homeworkId,
          student_id: studentId,
          is_done: next,
          done_at: next ? nowIso : null,
        },
        { onConflict: 'homework_id,student_id' },
      )

      setPendingIds((prev) => {
        const copy = new Set(prev)
        copy.delete(homeworkId)
        return copy
      })

      if (error) {
        // Rollback przy błędzie.
        setItems((prev) =>
          prev.map((h) =>
            h.homeworkId === homeworkId
              ? { ...h, isDone: !next, doneAt: !next ? nowIso : null }
              : h,
          ),
        )
        console.error('Homework toggle failed:', error)
      }
    })
  }

  return (
    <>
      {pending.length === 0 ? (
        <div
          className="rounded-card bg-surface p-4 text-center text-[13px] font-extrabold"
          style={{ color: '#22C55E' }}
        >
          🎉 Wszystko zrobione!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pending.map((hw) => (
            <HomeworkPendingCard
              key={hw.homeworkId}
              hw={hw}
              onToggle={() => toggle(hw.homeworkId)}
              disabled={pendingIds.has(hw.homeworkId)}
            />
          ))}
        </div>
      )}
      {done.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-dim">
            ✓ Zrobione ({done.length})
          </div>
          {done.map((hw) => (
            <HomeworkDoneCard
              key={hw.homeworkId}
              hw={hw}
              onToggle={() => toggle(hw.homeworkId)}
              disabled={pendingIds.has(hw.homeworkId)}
            />
          ))}
        </div>
      )}
    </>
  )
}

function HomeworkPendingCard({
  hw,
  onToggle,
  disabled,
}: {
  hw: HomeworkRow
  onToggle: () => void
  disabled: boolean
}) {
  return (
    <article
      className="rounded-card p-3"
      style={{ borderLeft: '3px solid #FFCA28', backgroundColor: '#FFCA2810' }}
    >
      <div className="flex items-start gap-3">
        <HomeworkCheckbox done={false} onToggle={onToggle} disabled={disabled} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <SubjectDot color={hw.subjectColor} />
            <span className="text-[12px] font-extrabold text-primary">{hw.subjectName}</span>
            {hw.topic && (
              <span className="truncate text-[11px] text-secondary">• {hw.topic}</span>
            )}
          </div>
          <p className="mt-1 text-[12px] font-semibold" style={{ color: '#FFCA28' }}>
            {hw.content}
          </p>
          <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-secondary">
            <span>Zadane: {formatPolishDate(hw.lessonDate)}</span>
            {hw.dueDate && (
              <span style={{ color: '#F59E0B' }}>Termin: {formatPolishDate(hw.dueDate)}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function HomeworkDoneCard({
  hw,
  onToggle,
  disabled,
}: {
  hw: HomeworkRow
  onToggle: () => void
  disabled: boolean
}) {
  return (
    <article className="rounded-card bg-surface p-3 opacity-60">
      <div className="flex items-start gap-3">
        <HomeworkCheckbox done={true} onToggle={onToggle} disabled={disabled} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <SubjectDot color={hw.subjectColor} />
            <span className="text-[12px] font-extrabold text-primary line-through">
              {hw.subjectName}
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-secondary line-through">{hw.content}</p>
          <div className="mt-1">
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
              style={
                hw.isVerified
                  ? { backgroundColor: '#22C55E22', color: '#22C55E' }
                  : { backgroundColor: '#232840', color: '#9B97AF' }
              }
            >
              {hw.isVerified ? 'Sprawdzona ✓' : 'Niesprawdzona'}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
