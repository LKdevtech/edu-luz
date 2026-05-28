'use client'

// Module-level singleton wymuszający, że jednocześnie otwarty może być TYLKO
// JEDEN overlay odwołania (CancelLessonOverlay u ucznia, CancelOverlay
// u rodzica). Kliknięcie „Odwołaj" na jednej karcie zamyka overlay na innych.

type Listener = (activeId: string | null) => void

const listeners = new Set<Listener>()
let activeId: string | null = null

export function getActiveCancelOverlay(): string | null {
  return activeId
}

export function setActiveCancelOverlay(id: string | null): void {
  activeId = id
  listeners.forEach((l) => l(id))
}

export function subscribeCancelOverlay(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
