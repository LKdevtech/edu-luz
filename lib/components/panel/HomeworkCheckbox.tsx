'use client'

type HomeworkCheckboxProps = {
  done: boolean
  onToggle: () => void
  disabled?: boolean
}

/**
 * Kontrolowany checkbox PD — sam nie trzyma stanu ani nie wykonuje mutacji.
 * Stan i mutacja są właścicielstwem rodzica (HomeworkSection), żeby
 * przepięcie karty między „Do zrobienia" a „Zrobione" działało w realtime.
 */
export function HomeworkCheckbox({ done, onToggle, disabled = false }: HomeworkCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
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
