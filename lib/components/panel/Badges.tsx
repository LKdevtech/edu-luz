import type { Enums } from '@/lib/types/database.types'

// Kolory poziomów — sekcja 3.7 SYSTEM_INSTRUCTIONS_v2 + mockup
const LEVEL_COLORS: Record<Enums<'student_level'>, string> = {
  SP: '#06B6D4', // cyan
  E8: '#FFCA28', // tertiary (żółty)
  SR: '#3B8FF0', // primary (niebieski)
  SR_EXT: '#7C5CFC', // accent (fiolet)
  EM: '#EF4444', // danger (czerwony)
  EM_EXT: '#E84393', // pink (różowy)
}

export function LevelBadge({
  level,
  label,
}: {
  level: Enums<'student_level'>
  label: string
}) {
  const color = LEVEL_COLORS[level]
  return (
    <span
      className="inline-flex items-center rounded-[5px] px-[7px] py-0.5 text-[10px] font-extrabold uppercase"
      style={{ backgroundColor: `${color}29`, color }}
    >
      {label}
    </span>
  )
}

export function SubjectDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

type StatusMeta = {
  icon: string
  color: string
  label: string
}

const STATUS_META: Record<Enums<'lesson_status'>, StatusMeta> = {
  planned: { icon: '○', color: '#3B8FF0', label: 'Zaplanowana' },
  in_progress: { icon: '●', color: '#FFCA28', label: 'W trakcie' },
  completed: { icon: '✓', color: '#22C55E', label: 'Zrealizowana z wpisem' },
  completed_no_entry: { icon: '✓', color: '#FFCA28', label: 'Zrealizowana bez wpisu' },
  cancelled: { icon: '✕', color: '#EF4444', label: 'Odwołana' },
  no_show: { icon: '⊘', color: '#F59E0B', label: 'No-show' },
  makeup: { icon: '↻', color: '#7C5CFC', label: 'Odrabianie' },
}

export function StatusIcon({ status }: { status: Enums<'lesson_status'> }) {
  const m = STATUS_META[status]
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-[14px] font-extrabold"
      style={{ backgroundColor: `${m.color}26`, color: m.color }}
      aria-label={m.label}
    >
      {m.icon}
    </span>
  )
}

export function getLessonStatusMeta(status: Enums<'lesson_status'>): StatusMeta {
  return STATUS_META[status]
}
