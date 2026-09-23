import type { DateTimeString } from '@/types/iot'

/**
 * Spec time format helpers. EVERYTHING crosses the IotApi boundary as
 * "yyyy-MM-dd HH:mm:ss" local time; display variants derive from it.
 */

const pad = (n: number): string => String(n).padStart(2, '0')

/** Date → "yyyy-MM-dd HH:mm:ss" (local). */
export function formatDateTime(date: Date): DateTimeString {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

/** "yyyy-MM-dd HH:mm:ss" → Date. Invalid input → NaN date (caller validates). */
export function parseDateTime(value: DateTimeString): Date {
  const [datePart = '', timePart = ''] = value.split(' ')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm, ss] = timePart.split(':').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, ss ?? 0)
}

/** "yyyy-MM-dd HH:mm:ss" → table display "HH:mm - dd/MM/yyyy". */
export function formatDateTimeDisplay(value: DateTimeString): string {
  const d = parseDateTime(value)
  if (Number.isNaN(d.getTime())) return value
  return `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}
