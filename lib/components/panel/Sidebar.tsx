'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'

import type { PanelNavItem, PanelRoleBadge } from './PanelLayout'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

type SidebarProps = {
  navItems: PanelNavItem[]
  roleBadge: PanelRoleBadge
}

export function Sidebar({ navItems, roleBadge }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    })
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-subtle bg-alt md:flex">
      <div className="flex items-center gap-3 border-b border-subtle px-5 py-4">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-[10px] font-black text-white"
          style={{ background: 'linear-gradient(135deg, #3B8FF0, #7C5CFC)' }}
        >
          Ez
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="text-[15px] font-black text-primary">
            EDU <span className="text-link">LUZ</span>
          </span>
          <span
            className={cn(
              'mt-0.5 inline-block w-fit rounded-[4px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[1.5px]',
              roleBadge.bgClass,
              roleBadge.textClass,
            )}
          >
            {roleBadge.label}
          </span>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const showBadge = (item.badgeCount ?? 0) > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] transition-colors',
                isActive
                  ? 'bg-[rgba(59,143,240,0.09)] font-extrabold text-link'
                  : 'font-semibold text-secondary hover:bg-[rgba(59,143,240,0.06)] hover:text-primary',
              )}
            >
              <span className="text-base" aria-hidden>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold text-white"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  {item.badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-subtle p-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] font-semibold text-secondary transition-colors hover:bg-[rgba(239,68,68,0.08)] hover:text-[#EF4444] disabled:opacity-60"
        >
          <span className="text-base" aria-hidden>
            🚪
          </span>
          <span className="flex-1 text-left">{isPending ? 'Wylogowywanie…' : 'Wyloguj'}</span>
        </button>
      </div>
    </aside>
  )
}
