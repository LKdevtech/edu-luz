import Link from 'next/link'

import { getCurrentParentId } from '@/lib/auth/getCurrentParentId'
import { CancelOverlay } from '@/lib/components/panel/CancelOverlay'
import { ChildSwitcher } from '@/lib/components/panel/ChildSwitcher'
import { EntryCard } from '@/lib/components/panel/EntryCard'
import { LevelBadge, SubjectDot } from '@/lib/components/panel/Badges'
import { MakeupCard } from '@/lib/components/panel/MakeupCard'
import { PaymentCard } from '@/lib/components/panel/PaymentCard'
import {
  getParentDashboard,
  type ChildFilter,
  type ParentLessonRow,
} from '@/lib/queries/parent'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatLessonDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

type SearchParams = { child?: string }

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const parentId = await getCurrentParentId()
  const childFilter: ChildFilter = searchParams.child ?? 'all'
  const supabase = createSupabaseServerClient()
  const data = await getParentDashboard(supabase, parentId, childFilter)

  const switcherChildren = data.children.map((c) => ({
    id: c.id,
    initials: c.initials,
    color: c.avatarColor,
    shortName: c.firstName,
  }))
  const activeChildId = childFilter === 'all' ? null : childFilter

  const lessonsByDate = groupLessonsByDate(data.upcomingLessons)

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <ChildSwitcher options={switcherChildren} activeChildId={activeChildId} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* ───────── LEFT ───────── */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Nadchodzące lekcje */}
          <section>
            <SectionHeader
              icon="📅"
              title="Nadchodzące lekcje"
              count={data.upcomingLessons.length}
              link={{ href: hrefWithChild('/panel/parent/classes', childFilter), label: 'Zajęcia →' }}
            />
            {lessonsByDate.length === 0 ? (
              <EmptyState text="Brak zaplanowanych lekcji w najbliższych dniach." />
            ) : (
              <div className="flex flex-col gap-3">
                {lessonsByDate.map(([dateLabel, lessons], i) => (
                  <div key={dateLabel} className="flex flex-col gap-2">
                    <DateGroupHeader label={dateLabel} highlighted={i === 0} />
                    {lessons.map((l, idx) => (
                      <UpcomingLessonCard
                        key={`${l.id}:${l.childId}`}
                        lesson={l}
                        isNext={i === 0 && idx === 0}
                        parentId={parentId}
                        showChildName={childFilter === 'all'}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Ostatnie wpisy */}
          <section>
            <SectionHeader
              icon="📝"
              title="Ostatnie wpisy"
              count={data.recentEntries.length}
              link={{
                href: hrefWithChild('/panel/parent/classes?tab=history', childFilter),
                label: 'Wszystkie →',
              }}
            />
            {data.recentEntries.length === 0 ? (
              <EmptyState text="Brak wpisów z ostatnich 30 dni." />
            ) : (
              <div className="flex flex-col gap-2">
                {data.recentEntries.map((l) => (
                  <ParentEntryRow key={`${l.id}:${l.childId}`} lesson={l} showChild={childFilter === 'all'} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ───────── RIGHT ───────── */}
        <div className="flex flex-col gap-4">
          {/* Children quick info */}
          <aside className="rounded-card bg-alt p-4">
            <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
              👨‍👩‍👧‍👦 {childFilter === 'all' ? 'Twoje dzieci' : 'Wybrane dziecko'}
            </div>
            <div className="flex flex-col gap-2.5">
              {data.filteredChildren.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-[10px] bg-surface p-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-extrabold"
                    style={{ backgroundColor: `${c.avatarColor}29`, color: c.avatarColor }}
                  >
                    {c.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-extrabold text-primary">{c.fullName}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-secondary">
                      <span>{c.schoolClass}</span>
                      <LevelBadge level={c.level} label={c.levelLabel} />
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-secondary">
                    <div className="font-extrabold text-primary">{c.lessonsPerWeek}×/tydz</div>
                    <div>Frekw. {c.attendancePercent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Current payment */}
          {data.currentPayment && (
            <div>
              <SectionHeader
                icon="💳"
                title="Płatności"
                link={{ href: '/panel/parent/payments', label: 'Szczegóły →' }}
              />
              <PaymentCard payment={data.currentPayment} variant="current" showBreakdown={false} />
            </div>
          )}

          {/* Makeup */}
          {data.makeup.length > 0 && (
            <div>
              <SectionHeader
                icon="↻"
                title="Odrabianie"
                count={data.makeup.length}
                countColor="#F59E0B"
                countLabel="wymaga reakcji"
              />
              <div className="flex flex-col gap-2">
                {data.makeup.slice(0, 3).map((m) => (
                  <MakeupCard key={m.requestId} item={m} parentId={parentId} variant="compact" />
                ))}
              </div>
            </div>
          )}

          {/* Center contact */}
          <aside className="rounded-card bg-alt p-4">
            <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
              🏢 Centrum {data.center.name}
            </div>
            <div className="flex flex-col gap-2 text-[12px]">
              <div className="flex items-start gap-2">
                <span aria-hidden>📍</span>
                <span className="text-primary">{data.center.address}</span>
              </div>
              <div className="flex items-start gap-2">
                <span aria-hidden>📞</span>
                <span className="font-extrabold text-primary">{data.center.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <span aria-hidden>✉</span>
                <span className="text-primary">{data.center.email}</span>
              </div>
            </div>
            <button
              type="button"
              className="mt-3 w-full rounded-[8px] bg-[rgba(59,143,240,0.12)] px-3 py-2 text-[12px] font-extrabold text-link hover:bg-[rgba(59,143,240,0.2)]"
            >
              💬 Wyślij wiadomość
            </button>
          </aside>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Internal
// ════════════════════════════════════════════════════════════════════════════

function hrefWithChild(href: string, filter: ChildFilter): string {
  if (filter === 'all') return href
  return href.includes('?') ? `${href}&child=${filter}` : `${href}?child=${filter}`
}

function SectionHeader({
  icon,
  title,
  count,
  countColor,
  countLabel,
  link,
}: {
  icon: string
  title: string
  count?: number
  countColor?: string
  countLabel?: string
  link?: { href: string; label: string }
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[15px]" aria-hidden>
          {icon}
        </span>
        <h2 className="text-[15px] font-extrabold text-primary">{title}</h2>
        {typeof count === 'number' && count > 0 && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
            style={
              countColor
                ? { backgroundColor: `${countColor}22`, color: countColor }
                : { backgroundColor: '#232840', color: '#9B97AF' }
            }
          >
            {count} {countLabel ?? ''}
          </span>
        )}
      </div>
      {link && (
        <Link href={link.href} className="text-[12px] font-bold text-link hover:underline">
          {link.label}
        </Link>
      )}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">{text}</div>
  )
}

function DateGroupHeader({ label, highlighted }: { label: string; highlighted: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-[11px] font-extrabold uppercase tracking-[0.8px] ${
          highlighted ? 'text-link' : 'text-dim'
        }`}
      >
        {label}
      </span>
      {highlighted && (
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: '#22C55E', animation: 'pulse 2s infinite' }}
        />
      )}
    </div>
  )
}

function UpcomingLessonCard({
  lesson,
  isNext,
  parentId,
  showChildName,
}: {
  lesson: ParentLessonRow
  isNext: boolean
  parentId: string
  showChildName: boolean
}) {
  return (
    <article
      className="relative rounded-card bg-surface p-3 pr-[120px] transition-all hover:-translate-y-0.5 hover:shadow-card"
      style={{
        borderLeft: `3px solid ${lesson.subjectColor}`,
        backgroundColor: isNext ? 'rgba(59,143,240,0.04)' : undefined,
      }}
    >
      {isNext && (
        <span
          className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
          style={{
            backgroundColor: '#22C55E22',
            color: '#22C55E',
            animation: 'pulse 2s infinite',
          }}
        >
          Następna
        </span>
      )}
      <div className="flex items-center gap-2">
        {showChildName && (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold"
            style={{ backgroundColor: `${lesson.childAvatarColor}29`, color: lesson.childAvatarColor }}
          >
            {lesson.childInitials}
          </span>
        )}
        <SubjectDot color={lesson.subjectColor} />
        <span className="text-[13px] font-extrabold text-primary">{lesson.subjectName}</span>
        <LevelBadge level={lesson.level} label={lesson.levelLabel} />
        {lesson.form === 'group' && lesson.groupName && (
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
            style={{ backgroundColor: '#7C5CFC22', color: '#7C5CFC' }}
          >
            GRUPA
          </span>
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-secondary">
        <span>🕐 {lesson.startTime}–{lesson.endTime}</span>
        <span>👤 {lesson.tutorName}</span>
        {lesson.roomName && <span>📍 {lesson.roomName}</span>}
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <CancelOverlay
          lessonId={lesson.id}
          parentId={parentId}
          isWithin24h={lesson.isWithin24h}
        />
      </div>
    </article>
  )
}

function ParentEntryRow({
  lesson,
  showChild,
}: {
  lesson: ParentLessonRow
  showChild: boolean
}) {
  if (!lesson.entry) return null
  return (
    <div className="relative">
      {showChild && (
        <div
          className="mb-1 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-extrabold"
          style={{ backgroundColor: `${lesson.childAvatarColor}29`, color: lesson.childAvatarColor }}
        >
          <span>{lesson.childInitials}</span>
          <span>{lesson.childName}</span>
        </div>
      )}
      <EntryCard
        entryId={lesson.id}
        subjectName={lesson.subjectName}
        subjectColor={lesson.subjectColor}
        tutorName={lesson.tutorName}
        level={lesson.level}
        levelLabel={lesson.levelLabel}
        topic={lesson.entry.topic}
        noteForStudent={lesson.entry.noteForStudent}
        noteForParent={lesson.entry.noteForParent}
        lessonDate={lesson.date}
        homeworkContent={lesson.entry.homeworkContent}
        homeworkVerified={lesson.entry.homeworkVerified}
      />
    </div>
  )
}

function groupLessonsByDate(lessons: ParentLessonRow[]): Array<[string, ParentLessonRow[]]> {
  const buckets = new Map<string, ParentLessonRow[]>()
  for (const l of lessons) {
    const key = formatLessonDate(l.date)
    const arr = buckets.get(key) ?? []
    arr.push(l)
    buckets.set(key, arr)
  }
  return Array.from(buckets.entries())
}
