'use client'

import { useEffect, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  icon: string
  width?: number
  children: ReactNode
}

export function Modal({ open, onClose, title, icon, width = 560, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,12,20,0.75)' }}
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full overflow-auto rounded-[18px] bg-surface"
        style={{ width, border: '1px solid rgba(59,143,240,0.10)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-subtle bg-surface px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[18px]" aria-hidden>
              {icon}
            </span>
            <span className="text-[16px] font-extrabold text-primary">{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-alt text-[14px] text-secondary hover:bg-surface-hover hover:text-primary"
          >
            ✕
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string
  required?: boolean
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="mb-3">
      <label className="mb-1 flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-dim">
        {label}
        {required && <span style={{ color: '#EF4444' }}>*</span>}
        {hint && <span className="text-[10px] font-medium italic text-dim">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        'w-full rounded-[8px] border border-subtle bg-alt px-3 py-2 text-[13px] text-primary placeholder:text-dim focus:border-link focus:outline-none ' +
        (props.className ?? '')
      }
    />
  )
}

export function TextareaInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        'w-full resize-y rounded-[8px] border border-subtle bg-alt px-3 py-2 text-[13px] text-primary placeholder:text-dim focus:border-link focus:outline-none ' +
        (props.className ?? '')
      }
    />
  )
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        'w-full rounded-[8px] border border-subtle bg-alt px-3 py-2 text-[13px] text-primary focus:border-link focus:outline-none ' +
        (props.className ?? '')
      }
    >
      {props.children}
    </select>
  )
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-subtle pt-4">
      {children}
    </div>
  )
}

export function PrimaryBtn({
  children,
  onClick,
  disabled,
  color = '#3B8FF0',
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  color?: string
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-[8px] px-5 py-2 text-[13px] font-extrabold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      style={{ backgroundColor: color }}
    >
      {children}
    </button>
  )
}

export function GhostBtn({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-[8px] border border-subtle bg-transparent px-5 py-2 text-[13px] font-bold text-secondary transition-colors hover:bg-surface-hover disabled:opacity-50"
    >
      {children}
    </button>
  )
}
