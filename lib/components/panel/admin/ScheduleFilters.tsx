'use client'

// Cienki re-export: pasek filtrów + przełącznik widoku zostały scalone z głównym,
// interaktywnym widokiem harmonogramu (FilterBar wewnątrz AdminScheduleView),
// bo stan widoku/filtra jest ściśle powiązany z renderowaniem siatki.
export { AdminScheduleView } from './AdminScheduleView'
export { AdminScheduleView as ScheduleFilters } from './AdminScheduleView'
