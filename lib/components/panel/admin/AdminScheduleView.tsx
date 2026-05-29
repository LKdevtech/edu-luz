'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import type { Enums } from '@/lib/types/database.types'

import {
  DASH,
  DOT,
  LEVEL_COLOR,
  LEVEL_LABEL,
  SUBJECT_ABBR,
  SUBJECT_COLOR,
  STATUS_META,
  STATUS_ORDER,
  T,
  WEEK_DAYS_FULL,
  fmtRange,
  isAvailHour,
  type AvailRange,
  type ScheduleLesson,
  type ScheduleRoom,
  type ScheduleTutor,
  type TutorAvailability,
} from './ScheduleShared'

type ViewMode = 'day' | 'week' | 'avail'
type DetailLevel = 'detailed' | 'compact'
type FilterBy = 'tutor' | 'room'

type Props = {
  lessons: ScheduleLesson[]
  tutors: ScheduleTutor[]
  rooms: ScheduleRoom[]
  availability: Record<string, TutorAvailability>
  weekDayLabels: string[] // "Pon 16.06"
  dayHeaderLabel: string // "Czw 19.06.2026"
  weekRangeLabel: string // "16–21.06.2026"
  todayIdx: number // -1 jeśli dziś nie w tym tygodniu
  nowDecimal: number | null // godzina dziesiętna teraz (dla "now" linii), null jeśli nie dziś
  weekStart: string
  // bieżący stan z URL
  view: ViewMode
  detailLevel: DetailLevel
  filterBy: FilterBy
  filterTutorId: string
  filterRoomId: string
}

// ════════════════════════════════════════════════════════════════════════════
// Symbol statusu
// ════════════════════════════════════════════════════════════════════════════
function SB({ status, size }: { status: Enums<'lesson_status'>; size?: number }) {
  const s = STATUS_META[status]
  if (!s) return null
  return (
    <span title={s.label} style={{ fontSize: size ?? 11, fontWeight: 900, color: s.color, lineHeight: 1 }}>
      {s.symbol}
    </span>
  )
}

const S = 8
const E = 19

export function AdminScheduleView(props: Props) {
  const {
    lessons,
    tutors,
    rooms,
    availability,
    weekDayLabels,
    dayHeaderLabel,
    weekRangeLabel,
    todayIdx,
    nowDecimal,
    view,
    detailLevel,
    filterBy,
    filterTutorId,
    filterRoomId,
  } = props

  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [selected, setSelected] = useState<ScheduleLesson | null>(null)
  const [editAvailOpen, setEditAvailOpen] = useState(false)

  function push(next: URLSearchParams) {
    const q = next.toString()
    router.push(q ? `${pathname}?${q}` : pathname)
  }
  function setParam(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    push(next)
  }

  const filterValue = filterBy === 'tutor' ? filterTutorId : filterRoomId
  const filterRoomName = rooms.find((r) => r.id === filterRoomId)?.name ?? ''

  // Lekcje przefiltrowane wg aktualnego wymiaru.
  const filtered = useMemo(() => {
    if (filterBy === 'tutor') return lessons.filter((l) => l.tutorId === filterTutorId)
    return lessons.filter((l) => l.roomId === filterRoomId)
  }, [lessons, filterBy, filterTutorId, filterRoomId])

  const tutorData = filterBy === 'tutor' ? tutors.find((t) => t.id === filterTutorId) ?? null : null
  const avail = filterBy === 'tutor' ? availability[filterTutorId] ?? [] : []

  return (
    <div className="flex min-h-[60vh] flex-col" style={{ color: T.text, fontFamily: 'Nunito, sans-serif' }}>
      <FilterBar
        view={view}
        detailLevel={detailLevel}
        filterBy={filterBy}
        filterValue={filterValue}
        tutors={tutors}
        rooms={rooms}
        dayHeaderLabel={dayHeaderLabel}
        weekRangeLabel={weekRangeLabel}
        weekStart={props.weekStart}
        onView={(v) => setParam({ view: v })}
        onDetail={(d) => setParam({ mode: d })}
        onFilterBy={(by) =>
          setParam({
            by,
            tutor: by === 'tutor' ? tutors[0]?.id ?? null : null,
            room: by === 'room' ? rooms[0]?.id ?? null : null,
          })
        }
        onFilterValue={(v) => setParam(filterBy === 'tutor' ? { tutor: v } : { room: v })}
        onEditAvail={() => setEditAvailOpen(true)}
        onWeek={(iso) => setParam({ week: iso })}
        onToday={() => setParam({ week: null })}
      />
      <Legend />

      {view === 'day' && (
        <DayView
          lessons={filtered}
          filterBy={filterBy}
          tutorData={tutorData}
          filterRoomName={filterRoomName}
          avail={avail}
          todayIdx={todayIdx}
          nowDecimal={nowDecimal}
          dayHeaderLabel={dayHeaderLabel}
          onSelect={setSelected}
        />
      )}
      {view === 'week' && detailLevel === 'detailed' && (
        <WeekDetailed
          lessons={filtered}
          filterBy={filterBy}
          avail={avail}
          weekDayLabels={weekDayLabels}
          todayIdx={todayIdx}
          nowDecimal={nowDecimal}
          onSelect={setSelected}
        />
      )}
      {view === 'week' && detailLevel === 'compact' && (
        <WeekCompact lessons={filtered} filterBy={filterBy} weekDayLabels={weekDayLabels} todayIdx={todayIdx} />
      )}
      {view === 'avail' && (
        <AvailView
          tutors={tutors}
          rooms={rooms}
          availability={availability}
          allLessons={lessons}
          weekDayLabels={weekDayLabels}
          weekRangeLabel={weekRangeLabel}
          todayIdx={todayIdx}
        />
      )}

      {selected && (
        <>
          <div
            onClick={() => setSelected(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99 }}
          />
          <DetailPanel lesson={selected} weekDayLabels={weekDayLabels} onClose={() => setSelected(null)} />
        </>
      )}

      {editAvailOpen && tutorData && (
        <EditAvailModal tutor={tutorData} avail={avail} onClose={() => setEditAvailOpen(false)} />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Pasek filtrów
// ════════════════════════════════════════════════════════════════════════════
function FilterBar({
  view,
  detailLevel,
  filterBy,
  filterValue,
  tutors,
  rooms,
  dayHeaderLabel,
  weekRangeLabel,
  weekStart,
  onView,
  onDetail,
  onFilterBy,
  onFilterValue,
  onEditAvail,
  onWeek,
  onToday,
}: {
  view: ViewMode
  detailLevel: DetailLevel
  filterBy: FilterBy
  filterValue: string
  tutors: ScheduleTutor[]
  rooms: ScheduleRoom[]
  dayHeaderLabel: string
  weekRangeLabel: string
  weekStart: string
  onView: (v: ViewMode) => void
  onDetail: (d: DetailLevel) => void
  onFilterBy: (by: FilterBy) => void
  onFilterValue: (v: string) => void
  onEditAvail: () => void
  onWeek: (iso: string) => void
  onToday: () => void
}) {
  const btn = (active: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: active ? 800 : 500,
    fontFamily: 'Nunito, sans-serif',
    padding: '5px 12px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    background: active ? T.primary : 'transparent',
    color: active ? '#fff' : T.textMuted,
    transition: 'all 0.12s',
  })
  const sel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'Nunito, sans-serif',
    padding: '5px 10px',
    borderRadius: 8,
    border: '1px solid ' + T.cardBorder,
    background: T.surface,
    color: T.text,
    cursor: 'pointer',
    outline: 'none',
  }
  function shiftWeek(deltaDays: number) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + deltaDays)
    onWeek(d.toISOString().slice(0, 10))
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', background: T.surface, borderRadius: 8, padding: 2, gap: 2 }}>
        {(
          [
            ['day', 'Dzień'],
            ['week', 'Tydzień'],
            ['avail', 'Dostępność'],
          ] as Array<[ViewMode, string]>
        ).map(([v, lb]) => (
          <button key={v} onClick={() => onView(v)} style={btn(view === v)}>
            {lb}
          </button>
        ))}
      </div>
      <div style={{ width: 1, height: 22, background: T.cardBorder }} />
      {view !== 'avail' && (
        <>
          <span style={{ fontSize: 10, color: T.textDim, fontWeight: 600 }}>Widok wg:</span>
          <div style={{ display: 'flex', background: T.surface, borderRadius: 8, padding: 2, gap: 2 }}>
            <button onClick={() => onFilterBy('tutor')} style={btn(filterBy === 'tutor')}>
              Korepetytor
            </button>
            <button onClick={() => onFilterBy('room')} style={btn(filterBy === 'room')}>
              Sala
            </button>
          </div>
          <select value={filterValue} onChange={(e) => onFilterValue(e.target.value)} style={sel}>
            {filterBy === 'tutor'
              ? tutors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))
              : rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
          </select>
        </>
      )}
      {view === 'week' && (
        <>
          <div style={{ width: 1, height: 22, background: T.cardBorder }} />
          <div style={{ display: 'flex', background: T.surface, borderRadius: 8, padding: 2, gap: 2 }}>
            <button onClick={() => onDetail('detailed')} style={btn(detailLevel === 'detailed')}>
              Szczegółowy
            </button>
            <button onClick={() => onDetail('compact')} style={btn(detailLevel === 'compact')}>
              Uproszczony
            </button>
          </div>
        </>
      )}
      {filterBy === 'tutor' && view !== 'avail' && (
        <>
          <div style={{ width: 1, height: 22, background: T.cardBorder }} />
          <button
            onClick={onEditAvail}
            style={{
              fontSize: 10,
              fontWeight: 700,
              fontFamily: 'Nunito, sans-serif',
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid ' + T.cardBorder,
              background: 'transparent',
              color: T.tertiary,
              cursor: 'pointer',
            }}
          >
            Edytuj dostępność
          </button>
        </>
      )}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          onClick={() => shiftWeek(-7)}
          style={{ cursor: 'pointer', color: T.textDim, fontSize: 13, userSelect: 'none' }}
        >
          ←
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.text, fontFamily: 'Nunito, sans-serif' }}>
          {view === 'day' ? dayHeaderLabel : weekRangeLabel}
        </span>
        <span
          onClick={() => shiftWeek(7)}
          style={{ cursor: 'pointer', color: T.textDim, fontSize: 13, userSelect: 'none' }}
        >
          →
        </span>
        <button
          onClick={onToday}
          style={{
            fontSize: 9,
            fontWeight: 700,
            fontFamily: 'Nunito, sans-serif',
            padding: '3px 8px',
            borderRadius: 6,
            border: '1px solid ' + T.cardBorder,
            background: 'transparent',
            color: T.primary,
            cursor: 'pointer',
          }}
        >
          Dziś
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Legenda statusów + poziomów
// ════════════════════════════════════════════════════════════════════════════
function Legend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', padding: '6px 0', alignItems: 'center' }}>
      {STATUS_ORDER.map((k) => {
        const s = STATUS_META[k]
        return (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: s.color, width: 14, textAlign: 'center' }}>
              {s.symbol}
            </span>
            <span style={{ fontSize: 9, color: T.textDim }}>{s.label}</span>
          </div>
        )
      })}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 8 }}>
        <div style={{ width: 16, height: 10, background: T.danger + '0C', borderRadius: 2 }} />
        <span style={{ fontSize: 9, color: T.textDim }}>Poza dostępnością</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginLeft: 8,
          borderLeft: '1px solid ' + T.cardBorder,
          paddingLeft: 8,
        }}
      >
        <span style={{ fontSize: 9, color: T.textDim, fontWeight: 600 }}>Poziomy:</span>
        {(
          [
            ['SP', 'Podstawowa', T.cyan],
            ['E8', 'Egz.8kl.', T.tertiary],
            ['ŚR', 'Średnia', T.primary],
            ['ŚR★', 'Śr.rozsz.', T.accent],
            ['EM', 'Matura', T.danger],
            ['EM★', 'Mat.rozsz.', T.pink],
          ] as Array<[string, string, string]>
        ).map(([k, v, col], i) => (
          <span key={i} style={{ fontSize: 8, color: T.textDim }}>
            <span
              style={{
                fontWeight: 800,
                color: col,
                background: col + '15',
                padding: '0 3px',
                borderRadius: 2,
                marginRight: 2,
              }}
            >
              {k}
            </span>
            {v}
          </span>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Widok dnia
// ════════════════════════════════════════════════════════════════════════════
function DayView({
  lessons,
  filterBy,
  tutorData,
  filterRoomName,
  avail,
  todayIdx,
  nowDecimal,
  onSelect,
}: {
  lessons: ScheduleLesson[]
  filterBy: FilterBy
  tutorData: ScheduleTutor | null
  filterRoomName: string
  avail: TutorAvailability
  todayIdx: number
  nowDecimal: number | null
  dayHeaderLabel: string
  onSelect: (l: ScheduleLesson) => void
}) {
  const dayIdx = todayIdx >= 0 ? todayIdx : 0
  const dayLessons = lessons.filter((l) => l.dayIdx === dayIdx)
  const dayAvail = filterBy === 'tutor' ? avail[dayIdx] ?? null : null
  const HH = 54
  const totalH = (E - S) * HH
  const hours = Array.from({ length: E - S + 1 }, (_, i) => S + i)
  const showNow = nowDecimal != null && todayIdx === dayIdx
  const nowTop = showNow ? (nowDecimal! - S) * HH : 0

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      {filterBy === 'tutor' && tutorData && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0 10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{tutorData.fullName}</span>
          {tutorData.subjects.map((s, i) => (
            <span
              key={i}
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: SUBJECT_COLOR[s] ?? T.textDim,
                background: (SUBJECT_COLOR[s] ?? T.textDim) + '15',
                padding: '2px 7px',
                borderRadius: 50,
              }}
            >
              {s}
            </span>
          ))}
          {dayAvail && dayAvail.length > 0 ? (
            <span style={{ fontSize: 10, color: T.textDim }}>
              {'Dostępność: ' + dayAvail.map(([a, b]) => `${a}:00${DASH}${b}:00`).join(', ')}
            </span>
          ) : (
            <span style={{ fontSize: 10, color: T.danger, fontWeight: 700 }}>Niedostępny</span>
          )}
          <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 'auto' }}>{'Lekcji: ' + dayLessons.length}</span>
        </div>
      )}
      {filterBy === 'room' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0 10px' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{filterRoomName}</span>
          <span style={{ fontSize: 10, color: T.textMuted }}>{'Lekcji: ' + dayLessons.length}</span>
        </div>
      )}
      <div
        style={{
          display: 'flex',
          borderRadius: 10,
          border: '1px solid ' + T.cardBorder,
          background: T.surface,
          overflow: 'hidden',
        }}
      >
        <div style={{ width: 46, flexShrink: 0, borderRight: '1px solid ' + T.cardBorder, position: 'relative' }}>
          {hours.map((h) => (
            <div
              key={h}
              style={{
                position: 'absolute',
                top: (h - S) * HH,
                right: 4,
                fontSize: 9,
                fontWeight: 700,
                color: T.textMuted,
                transform: 'translateY(-5px)',
              }}
            >
              {h + ':00'}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, position: 'relative', height: totalH, minWidth: 280 }}>
          {hours.map((h) => (
            <div
              key={h}
              style={{
                position: 'absolute',
                top: (h - S) * HH,
                left: 0,
                right: 0,
                borderTop: '1px solid rgba(59,143,240,0.18)',
              }}
            />
          ))}
          {hours.slice(0, -1).map((h) => (
            <div
              key={'half' + h}
              style={{
                position: 'absolute',
                top: (h - S + 0.5) * HH,
                left: 0,
                right: 0,
                borderTop: '1px dashed rgba(59,143,240,0.08)',
              }}
            />
          ))}
          {filterBy === 'tutor' &&
            dayAvail &&
            Array.from({ length: E - S }, (_, i) => S + i).map((h) =>
              !isAvailHour(dayAvail, h) ? (
                <div
                  key={'ua' + h}
                  style={{ position: 'absolute', top: (h - S) * HH, left: 0, right: 0, height: HH, background: T.danger + '0C' }}
                />
              ) : null,
            )}
          {filterBy === 'tutor' && !dayAvail && (
            <div style={{ position: 'absolute', inset: 0, background: T.danger + '0C' }} />
          )}
          {showNow && (
            <div
              style={{
                position: 'absolute',
                top: nowTop,
                left: 0,
                right: 0,
                zIndex: 15,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: 50, background: T.danger }} />
              <div style={{ flex: 1, height: 2, background: T.danger }} />
            </div>
          )}
          {dayLessons.map((l, i) => {
            const top = (l.start - S) * HH
            const ht = (l.end - l.start) * HH - 2
            const st = STATUS_META[l.status]
            const isCan = l.status === 'cancelled' || l.status === 'no_show'
            const isDone = l.status === 'completed' || l.status === 'completed_no_entry'
            return (
              <div
                key={i}
                onClick={() => onSelect(l)}
                style={{
                  position: 'absolute',
                  top,
                  left: 6,
                  right: 6,
                  height: ht,
                  background: st.bg,
                  borderLeft: '3px solid ' + st.color,
                  borderRadius: 7,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  opacity: isCan ? 0.45 : isDone ? 0.72 : 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6,
                  textDecoration: isCan ? 'line-through' : 'none',
                  transition: 'all 0.1s',
                  zIndex: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.zIndex = '10'
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.zIndex = '1'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <SB status={l.status} size={12} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {l.studentLabel}
                    </span>
                    {l.level && (
                      <span
                        style={{
                          fontSize: 7,
                          fontWeight: 800,
                          color: LEVEL_COLOR[l.level],
                          background: LEVEL_COLOR[l.level] + '15',
                          padding: '0px 4px',
                          borderRadius: 3,
                          flexShrink: 0,
                        }}
                      >
                        {LEVEL_LABEL[l.level]}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 9, color: T.textMuted }}>
                    {(SUBJECT_ABBR[l.subjectName] ?? l.subjectName) +
                      ' ' +
                      DOT +
                      ' ' +
                      fmtRange(l.start, l.end) +
                      (filterBy === 'room' ? ' ' + DOT + ' ' + l.tutorInitials : '')}
                  </div>
                </div>
                {l.status === 'makeup' && (
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      color: T.accent,
                      background: T.accent + '15',
                      padding: '1px 4px',
                      borderRadius: 3,
                    }}
                  >
                    ODR
                  </span>
                )}
                {filterBy === 'tutor' && <span style={{ fontSize: 8, color: T.textDim }}>{l.roomName}</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Tydzień — szczegółowy (siatka 6 dni)
// ════════════════════════════════════════════════════════════════════════════
function WeekDetailed({
  lessons,
  filterBy,
  avail,
  weekDayLabels,
  todayIdx,
  nowDecimal,
  onSelect,
}: {
  lessons: ScheduleLesson[]
  filterBy: FilterBy
  avail: TutorAvailability
  weekDayLabels: string[]
  todayIdx: number
  nowDecimal: number | null
  onSelect: (l: ScheduleLesson) => void
}) {
  const HH = 42
  const totalH = (E - S) * HH
  const hours = Array.from({ length: E - S + 1 }, (_, i) => S + i)
  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div
        style={{
          display: 'flex',
          borderRadius: 10,
          border: '1px solid ' + T.cardBorder,
          background: T.surface,
          overflow: 'hidden',
          minWidth: 660,
        }}
      >
        <div style={{ width: 40, flexShrink: 0, borderRight: '1px solid ' + T.cardBorder }}>
          <div style={{ height: 30 }} />
          <div style={{ position: 'relative', height: totalH }}>
            {hours.map((h) => (
              <div
                key={h}
                style={{
                  position: 'absolute',
                  top: (h - S) * HH,
                  right: 3,
                  fontSize: 8,
                  fontWeight: 700,
                  color: T.textMuted,
                  transform: 'translateY(-5px)',
                }}
              >
                {h + ':00'}
              </div>
            ))}
          </div>
        </div>
        {weekDayLabels.map((dayLabel, di) => {
          const dayLessons = lessons.filter((l) => l.dayIdx === di)
          const isToday = di === todayIdx
          const dayAvail = filterBy === 'tutor' ? avail[di] ?? null : null
          return (
            <div
              key={di}
              style={{
                flex: 1,
                minWidth: 100,
                borderRight: di < 5 ? '1px solid ' + T.cardBorder : 'none',
                background: isToday ? T.primary + '04' : 'transparent',
              }}
            >
              <div
                style={{
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid ' + T.cardBorder,
                  background: isToday ? T.primary + '10' : T.bgAlt,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: isToday ? 800 : 600, color: isToday ? T.primary : T.textMuted }}>
                  {dayLabel}
                </span>
                <span style={{ fontSize: 8, color: T.textDim, marginLeft: 4 }}>{'(' + dayLessons.length + ')'}</span>
              </div>
              <div style={{ position: 'relative', height: totalH }}>
                {hours.map((h) => (
                  <div
                    key={h}
                    style={{
                      position: 'absolute',
                      top: (h - S) * HH,
                      left: 0,
                      right: 0,
                      borderTop: '1px solid rgba(59,143,240,0.18)',
                    }}
                  />
                ))}
                {filterBy === 'tutor' &&
                  dayAvail &&
                  Array.from({ length: E - S }, (_, i) => S + i).map((h) =>
                    !isAvailHour(dayAvail, h) ? (
                      <div
                        key={'ua' + h}
                        style={{ position: 'absolute', top: (h - S) * HH, left: 0, right: 0, height: HH, background: T.danger + '0C' }}
                      />
                    ) : null,
                  )}
                {filterBy === 'tutor' && !dayAvail && (
                  <div style={{ position: 'absolute', inset: 0, background: T.danger + '0C' }} />
                )}
                {isToday && nowDecimal != null && (
                  <div
                    style={{
                      position: 'absolute',
                      top: (nowDecimal - S) * HH,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: T.danger,
                      zIndex: 15,
                    }}
                  />
                )}
                {dayLessons.map((l, li) => {
                  const top = (l.start - S) * HH
                  const ht = (l.end - l.start) * HH - 2
                  const st = STATUS_META[l.status]
                  const isCan = l.status === 'cancelled' || l.status === 'no_show'
                  const isDone = l.status === 'completed' || l.status === 'completed_no_entry'
                  return (
                    <div
                      key={li}
                      onClick={() => onSelect(l)}
                      style={{
                        position: 'absolute',
                        top,
                        left: 2,
                        right: 2,
                        height: ht,
                        background: st.bg,
                        borderLeft: '3px solid ' + st.color,
                        borderRadius: 5,
                        padding: '2px 4px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        opacity: isCan ? 0.4 : isDone ? 0.7 : 1,
                        fontSize: 9,
                        transition: 'all 0.1s',
                        zIndex: 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.zIndex = '10'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.zIndex = '1'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <SB status={l.status} size={9} />
                        <span
                          style={{
                            fontWeight: 700,
                            color: T.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {l.studentLabel}
                        </span>
                      </div>
                      <div style={{ color: T.textDim, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <span style={{ fontWeight: 700, color: SUBJECT_COLOR[l.subjectName] ?? T.textDim }}>
                          {SUBJECT_ABBR[l.subjectName] ?? l.subjectName.slice(0, 3)}
                        </span>
                        {l.level && <span style={{ fontSize: 7, fontWeight: 800, color: LEVEL_COLOR[l.level] }}>{LEVEL_LABEL[l.level]}</span>}
                        <span style={{ marginLeft: 2 }}>{fmtRange(l.start, l.end)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Tydzień — uproszczony (tabela slotów godzinowych)
// ════════════════════════════════════════════════════════════════════════════
function WeekCompact({
  lessons,
  filterBy,
  weekDayLabels,
  todayIdx,
}: {
  lessons: ScheduleLesson[]
  filterBy: FilterBy
  weekDayLabels: string[]
  todayIdx: number
}) {
  const thSt: React.CSSProperties = {
    padding: '7px 5px',
    textAlign: 'center',
    background: T.bgAlt,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    borderBottom: '1px solid ' + T.cardBorder,
  }
  const slots = new Map<string, { time: string; start: number; days: Record<number, ScheduleLesson[]> }>()
  for (const l of lessons) {
    const key = fmtRange(l.start, l.end)
    if (!slots.has(key)) slots.set(key, { time: key, start: l.start, days: {} })
    const slot = slots.get(key)!
    if (!slot.days[l.dayIdx]) slot.days[l.dayIdx] = []
    slot.days[l.dayIdx]!.push(l)
  }
  const sorted = Array.from(slots.values()).sort((a, b) => a.start - b.start)
  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ borderRadius: 10, border: '1px solid ' + T.cardBorder, background: T.surface, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 660 }}>
          <thead>
            <tr>
              <th style={{ ...thSt, width: 75, textAlign: 'left', paddingLeft: 8 }}>Godziny</th>
              {weekDayLabels.map((d, i) => (
                <th key={i} style={{ ...thSt, background: i === todayIdx ? T.primary + '10' : T.bgAlt }}>
                  <span style={{ fontSize: 10, fontWeight: i === todayIdx ? 800 : 600, color: i === todayIdx ? T.primary : T.textMuted }}>
                    {d}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((slot, si) => (
              <tr key={si} style={{ borderTop: '1px solid rgba(59,143,240,0.18)' }}>
                <td
                  style={{
                    padding: '6px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.textDim,
                    verticalAlign: 'top',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {slot.time}
                </td>
                {weekDayLabels.map((_, di) => {
                  const dls = slot.days[di] ?? []
                  return (
                    <td
                      key={di}
                      style={{ padding: '5px 6px', verticalAlign: 'top', background: di === todayIdx ? T.primary + '04' : 'transparent' }}
                    >
                      {dls.length === 0 ? (
                        <span style={{ fontSize: 9, color: T.textDim + '40' }}>{DASH}</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {dls.map((l, li) => {
                            const isCan = l.status === 'cancelled' || l.status === 'no_show'
                            return (
                              <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 3, opacity: isCan ? 0.4 : 1 }}>
                                <SB status={l.status} size={10} />
                                <span
                                  style={{ fontSize: 9, fontWeight: 600, color: T.text, textDecoration: isCan ? 'line-through' : 'none' }}
                                >
                                  {l.studentLabel.length > 11 ? l.studentLabel.slice(0, 11) + '…' : l.studentLabel}
                                </span>
                                <span style={{ fontSize: 7, color: SUBJECT_COLOR[l.subjectName] ?? T.textDim, fontWeight: 700 }}>
                                  {SUBJECT_ABBR[l.subjectName] ?? l.subjectName.slice(0, 3)}
                                </span>
                                {l.level && <span style={{ fontSize: 6, fontWeight: 800, color: LEVEL_COLOR[l.level] }}>{LEVEL_LABEL[l.level]}</span>}
                                {filterBy === 'room' && <span style={{ fontSize: 7, color: T.textDim }}>{l.tutorInitials}</span>}
                                {filterBy === 'tutor' && (
                                  <span style={{ fontSize: 7, color: T.textDim }}>{l.roomName.replace('Sala ', 'S')}</span>
                                )}
                                {l.status === 'makeup' && <span style={{ fontSize: 6, fontWeight: 800, color: T.accent }}>ODR</span>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={weekDayLabels.length + 1} style={{ padding: 20, textAlign: 'center', fontSize: 11, color: T.textDim }}>
                  Brak lekcji w tym tygodniu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '10px 0', flexWrap: 'wrap' }}>
        {STATUS_ORDER.map((k) => {
          const s = STATUS_META[k]
          const c = lessons.filter((l) => l.status === k).length
          if (c === 0) return null
          return (
            <div
              key={k}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                background: T.surface,
                padding: '3px 8px',
                borderRadius: 6,
                border: '1px solid ' + T.cardBorder,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 900, color: s.color }}>{s.symbol}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: s.color }}>{c}</span>
              <span style={{ fontSize: 9, color: T.textDim }}>{s.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Dostępność (wolne godziny korepetytorów i sal)
// ════════════════════════════════════════════════════════════════════════════
function AvailView({
  tutors,
  rooms,
  availability,
  allLessons,
  weekDayLabels,
  weekRangeLabel,
  todayIdx,
}: {
  tutors: ScheduleTutor[]
  rooms: ScheduleRoom[]
  availability: Record<string, TutorAvailability>
  allLessons: ScheduleLesson[]
  weekDayLabels: string[]
  weekRangeLabel: string
  todayIdx: number
}) {
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i)
  const thBase: React.CSSProperties = { padding: '6px 4px', textAlign: 'center', borderBottom: '1px solid ' + T.cardBorder }
  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: T.text, padding: '8px 0 12px' }}>
        {'Dostępność korepetytorów i sal ' + DASH + ' tydzień ' + weekRangeLabel}
      </div>

      {/* Korepetytorzy */}
      <div
        style={{
          borderRadius: 10,
          border: '1px solid ' + T.cardBorder,
          background: T.surface,
          overflow: 'hidden',
          marginBottom: 20,
        }}
      >
        <div style={{ padding: '8px 12px', background: T.bgAlt, borderBottom: '1px solid ' + T.cardBorder, fontSize: 11, fontWeight: 800, color: T.text }}>
          {'Korepetytorzy ' + DASH + ' wolne godziny'}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 660 }}>
          <thead>
            <tr>
              <th style={{ ...thBase, textAlign: 'left', fontSize: 10, color: T.textDim, width: 120 }}>Korepetytor</th>
              {weekDayLabels.map((d, i) => (
                <th
                  key={i}
                  style={{ ...thBase, fontSize: 10, color: i === todayIdx ? T.primary : T.textDim, fontWeight: i === todayIdx ? 800 : 600, background: i === todayIdx ? T.primary + '06' : 'transparent' }}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tutors.map((tut, ti) => {
              const ta = availability[tut.id] ?? []
              return (
                <tr key={ti} style={{ borderTop: ti > 0 ? '1px solid ' + T.cardBorder : 'none' }}>
                  <td style={{ padding: '8px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          background: T.primary + '20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          fontWeight: 800,
                          color: T.primary,
                        }}
                      >
                        {tut.initials}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.text }}>{tut.fullName.split(' ')[0]}</span>
                    </div>
                  </td>
                  {weekDayLabels.map((_, di) => {
                    const dayA = ta[di]
                    const dayLessons = allLessons.filter((l) => l.dayIdx === di && l.tutorId === tut.id && l.status !== 'cancelled')
                    const busyHours = new Set<number>()
                    dayLessons.forEach((l) => {
                      for (let h = Math.floor(l.start); h < Math.ceil(l.end); h++) busyHours.add(h)
                    })
                    if (!dayA)
                      return (
                        <td key={di} style={{ padding: '6px 4px', textAlign: 'center', background: di === todayIdx ? T.primary + '04' : 'transparent' }}>
                          <span style={{ fontSize: 9, color: T.danger + '60' }}>Wolne</span>
                        </td>
                      )
                    const freeSlots: number[] = []
                    dayA.forEach(([a, b]) => {
                      for (let h = a; h < b; h++) if (!busyHours.has(h)) freeSlots.push(h)
                    })
                    return (
                      <td key={di} style={{ padding: '4px 3px', verticalAlign: 'top', background: di === todayIdx ? T.primary + '04' : 'transparent' }}>
                        {freeSlots.length === 0 ? (
                          <div style={{ fontSize: 8, color: T.danger, textAlign: 'center', fontWeight: 700 }}>Pełny</div>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                            {freeSlots.map((h) => (
                              <span key={h} style={{ fontSize: 8, fontWeight: 700, color: T.success, background: T.success + '12', padding: '1px 4px', borderRadius: 3 }}>
                                {h + ':00'}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Sale */}
      <div style={{ borderRadius: 10, border: '1px solid ' + T.cardBorder, background: T.surface, overflow: 'hidden' }}>
        <div style={{ padding: '8px 12px', background: T.bgAlt, borderBottom: '1px solid ' + T.cardBorder, fontSize: 11, fontWeight: 800, color: T.text }}>
          {'Sale ' + DASH + ' wolne godziny'}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 660 }}>
          <thead>
            <tr>
              <th style={{ ...thBase, textAlign: 'left', fontSize: 10, color: T.textDim, width: 120 }}>Sala</th>
              {weekDayLabels.map((d, i) => (
                <th
                  key={i}
                  style={{ ...thBase, fontSize: 10, color: i === todayIdx ? T.primary : T.textDim, fontWeight: i === todayIdx ? 800 : 600, background: i === todayIdx ? T.primary + '06' : 'transparent' }}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, ri) => (
              <tr key={ri} style={{ borderTop: ri > 0 ? '1px solid ' + T.cardBorder : 'none' }}>
                <td style={{ padding: '8px 8px', fontSize: 11, fontWeight: 700, color: T.text }}>{room.name}</td>
                {weekDayLabels.map((_, di) => {
                  const dayLessons = allLessons.filter((l) => l.dayIdx === di && l.roomId === room.id && l.status !== 'cancelled')
                  const busyHours = new Set<number>()
                  dayLessons.forEach((l) => {
                    for (let h = Math.floor(l.start); h < Math.ceil(l.end); h++) busyHours.add(h)
                  })
                  const freeSlots = hours.filter((h) => !busyHours.has(h))
                  return (
                    <td key={di} style={{ padding: '4px 3px', verticalAlign: 'top', background: di === todayIdx ? T.primary + '04' : 'transparent' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                        {freeSlots.map((h) => (
                          <span key={h} style={{ fontSize: 8, fontWeight: 700, color: T.success, background: T.success + '12', padding: '1px 4px', borderRadius: 3 }}>
                            {h + ':00'}
                          </span>
                        ))}
                        {freeSlots.length === 0 && <span style={{ fontSize: 8, color: T.danger, fontWeight: 700 }}>Pełna</span>}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Panel szczegółów lekcji (wysuwany z prawej)
// ════════════════════════════════════════════════════════════════════════════
function DetailPanel({
  lesson,
  weekDayLabels,
  onClose,
}: {
  lesson: ScheduleLesson
  weekDayLabels: string[]
  onClose: () => void
}) {
  const st = STATUS_META[lesson.status]
  const col = SUBJECT_COLOR[lesson.subjectName] ?? T.textDim

  const router = useRouter()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submitCancel() {
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/admin/cancel-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: lesson.id, reason }),
      })
      const json: { error?: string; report?: unknown } = await res.json()
      if (!res.ok || !json.report) {
        setErr(json.error ?? `Błąd ${res.status}.`)
        return
      }
      setCancelOpen(false)
      router.refresh()
      onClose()
    } catch {
      setErr('Błąd połączenia z serwerem.')
    } finally {
      setBusy(false)
    }
  }

  const actions: Array<{ label: string; color: string; onClick?: () => void }> = []
  if (lesson.status === 'planned') {
    actions.push({ label: 'Edytuj lekcję', color: T.primary })
    actions.push({ label: 'Odwołaj lekcję', color: T.danger, onClick: () => setCancelOpen(true) })
    actions.push({ label: 'Zmień salę', color: T.tertiary })
  }
  if (lesson.status === 'in_progress') actions.push({ label: 'Zmień salę', color: T.tertiary })
  if (lesson.status === 'completed') actions.push({ label: 'Zobacz wpis', color: T.success })
  if (lesson.status === 'completed_no_entry') actions.push({ label: 'Brak wpisu — przypomnij', color: T.tertiary })
  if (lesson.status === 'no_show' || lesson.status === 'cancelled')
    actions.push({ label: 'Zaplanuj odrabianie', color: T.accent })

  const rows: Array<{ label: string; value: string; color?: string }> = [
    { label: 'Uczeń / Grupa', value: lesson.studentLabel },
    { label: 'Przedmiot', value: `${lesson.subjectName} (${lesson.type})`, color: col },
    { label: 'Poziom', value: lesson.level ? LEVEL_LABEL[lesson.level] : '—' },
    { label: 'Godzina', value: fmtRange(lesson.start, lesson.end) },
    { label: 'Dzień', value: weekDayLabels[lesson.dayIdx] ?? '—' },
    { label: 'Korepetytor', value: lesson.tutorName },
    { label: 'Sala', value: lesson.roomName },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 300,
        background: T.bgAlt,
        borderLeft: '1px solid ' + T.cardBorder,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-6px 0 24px rgba(0,0,0,0.4)',
        animation: 'adminSchedSlideIn 0.2s ease',
      }}
    >
      <style>{`@keyframes adminSchedSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid ' + T.cardBorder,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Szczegóły lekcji</span>
        <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 16, color: T.textDim }}>
          ×
        </span>
      </div>
      <div style={{ padding: 16, flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <SB status={lesson.status} size={14} />
          <span style={{ fontSize: 11, fontWeight: 700, color: st.color, background: st.bg, padding: '2px 8px', borderRadius: 50 }}>
            {st.label}
          </span>
        </div>
        {rows.map((d, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div
              style={{ fontSize: 8, color: T.textDim, marginBottom: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {d.label}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: d.color ?? T.text }}>{d.value}</div>
          </div>
        ))}
        {actions.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'Nunito, sans-serif',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  background: a.color + '12',
                  color: a.color,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = a.color
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = a.color + '12'
                  e.currentTarget.style.color = a.color
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {cancelOpen && (
        <div
          onClick={() => !busy && setCancelOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 380,
              background: T.bgAlt,
              border: '1px solid ' + T.cardBorder,
              borderRadius: 14,
              padding: 18,
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: T.text, marginBottom: 4 }}>
              Odwołaj lekcję
            </div>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 12 }}>
              {lesson.subjectName} · {lesson.studentLabel} · {fmtRange(lesson.start, lesson.end)}
            </div>
            <label style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: 'uppercase' }}>
              Powód odwołania
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="np. choroba korepetytora, awaria sali…"
              style={{
                width: '100%',
                marginTop: 6,
                padding: 10,
                fontSize: 12,
                fontFamily: 'inherit',
                color: T.text,
                background: T.bg,
                border: '1px solid ' + T.cardBorder,
                borderRadius: 10,
                resize: 'vertical',
                outline: 'none',
              }}
            />
            {err && (
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: T.danger }}>{err}</div>
            )}
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setCancelOpen(false)}
                disabled={busy}
                style={{
                  padding: '8px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  borderRadius: 8,
                  border: '1px solid ' + T.cardBorder,
                  background: 'transparent',
                  color: T.textMuted,
                  cursor: busy ? 'wait' : 'pointer',
                }}
              >
                Anuluj
              </button>
              <button
                onClick={submitCancel}
                disabled={busy}
                style={{
                  padding: '8px 14px',
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: 'inherit',
                  borderRadius: 8,
                  border: 'none',
                  background: T.danger,
                  color: '#fff',
                  cursor: busy ? 'wait' : 'pointer',
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {busy ? 'Odwoływanie…' : 'Odwołaj i powiadom'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Modal edycji dostępności (wizualny — bez zapisu do bazy)
// ════════════════════════════════════════════════════════════════════════════
function EditAvailModal({
  tutor,
  avail,
  onClose,
}: {
  tutor: ScheduleTutor
  avail: TutorAvailability
  onClose: () => void
}) {
  const [local, setLocal] = useState<TutorAvailability>(() =>
    Array.from({ length: 6 }, (_, i) => {
      const day = avail[i]
      return day ? day.map((b) => [b[0], b[1]] as AvailRange) : null
    }),
  )
  const hoursOpts = Array.from({ length: 14 }, (_, i) => 7 + i)

  function update(di: number, value: AvailRange[] | null) {
    setLocal((prev) => prev.map((d, i) => (i === di ? value : d)))
  }
  function toggleDay(di: number) {
    update(di, local[di] ? null : [[9, 17]])
  }
  function setBlock(di: number, bi: number, field: 0 | 1, val: number) {
    const blocks = (local[di] ?? []).map((b) => [b[0], b[1]] as AvailRange)
    blocks[bi]![field] = val
    if (blocks[bi]![0] >= blocks[bi]![1]) blocks[bi]![1] = blocks[bi]![0] + 1
    update(di, blocks)
  }
  function addBlock(di: number) {
    const blocks = (local[di] ?? []).map((b) => [b[0], b[1]] as AvailRange)
    const lastEnd = blocks.length > 0 ? blocks[blocks.length - 1]![1] : 9
    blocks.push([lastEnd + 1, lastEnd + 3 > 20 ? 20 : lastEnd + 3])
    update(di, blocks)
  }
  function removeBlock(di: number, bi: number) {
    const blocks = (local[di] ?? []).map((b) => [b[0], b[1]] as AvailRange)
    blocks.splice(bi, 1)
    update(di, blocks.length > 0 ? blocks : null)
  }

  const selSt: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'Nunito, sans-serif',
    padding: '4px 8px',
    borderRadius: 6,
    border: '1px solid ' + T.cardBorder,
    background: T.surface,
    color: T.text,
    cursor: 'pointer',
    outline: 'none',
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-auto p-4"
      style={{ background: 'rgba(10,12,20,0.75)' }}
      onClick={onClose}
    >
      <div
        className="mt-10 w-full max-w-[680px] rounded-[18px]"
        style={{ background: T.surface, border: '1px solid ' + T.cardBorder, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid ' + T.cardBorder,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{'Edycja dostępności: ' + tutor.fullName}</span>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 16, color: T.textDim }}>
            ×
          </span>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ borderRadius: 10, border: '1px solid ' + T.cardBorder, background: T.bgAlt, overflow: 'hidden' }}>
            {WEEK_DAYS_FULL.map((dayName, di) => {
              const dayBlocks = local[di]
              return (
                <div key={di} style={{ padding: '12px 16px', borderTop: di > 0 ? '1px solid ' + T.cardBorder : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: dayBlocks ? 8 : 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.text, width: 100 }}>{dayName}</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!dayBlocks} onChange={() => toggleDay(di)} style={{ accentColor: T.primary }} />
                      <span style={{ fontSize: 11, color: dayBlocks ? T.success : T.textDim, fontWeight: 600 }}>
                        {dayBlocks ? 'Dostępny' : 'Wolne'}
                      </span>
                    </label>
                  </div>
                  {dayBlocks &&
                    dayBlocks.map((block, bi) => (
                      <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 112, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, width: 50 }}>{'Blok ' + (bi + 1)}</span>
                        <span style={{ fontSize: 10, color: T.textDim }}>od</span>
                        <select value={block[0]} onChange={(e) => setBlock(di, bi, 0, parseInt(e.target.value))} style={selSt}>
                          {hoursOpts.map((h) => (
                            <option key={h} value={h}>
                              {h + ':00'}
                            </option>
                          ))}
                        </select>
                        <span style={{ fontSize: 10, color: T.textDim }}>do</span>
                        <select value={block[1]} onChange={(e) => setBlock(di, bi, 1, parseInt(e.target.value))} style={selSt}>
                          {hoursOpts
                            .filter((h) => h > block[0])
                            .map((h) => (
                              <option key={h} value={h}>
                                {h + ':00'}
                              </option>
                            ))}
                        </select>
                        {dayBlocks.length > 1 && (
                          <button
                            onClick={() => removeBlock(di, bi)}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              fontFamily: 'Nunito, sans-serif',
                              padding: '3px 8px',
                              borderRadius: 6,
                              border: 'none',
                              background: T.danger + '15',
                              color: T.danger,
                              cursor: 'pointer',
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  {dayBlocks && (
                    <button
                      onClick={() => addBlock(di)}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: 'Nunito, sans-serif',
                        padding: '3px 10px',
                        borderRadius: 6,
                        border: '1px dashed ' + T.cardBorder,
                        background: 'transparent',
                        color: T.primary,
                        cursor: 'pointer',
                        marginLeft: 112,
                        marginTop: 2,
                      }}
                    >
                      + Dodaj blok
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ padding: '14px 0 0', fontSize: 10, color: T.textDim }}>
            Wiele bloków na dzień = przerwy w dostępności (np. zajęcia na uczelni w środku dnia).
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button
              onClick={onClose}
              style={{
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'Nunito, sans-serif',
                padding: '7px 16px',
                borderRadius: 8,
                border: '1px solid ' + T.cardBorder,
                background: 'transparent',
                color: T.textMuted,
                cursor: 'pointer',
              }}
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
