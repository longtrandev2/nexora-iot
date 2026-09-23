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

/**
 * "yyyy-MM-dd HH:mm:ss" → relative label vs now:
 * "Vừa xong" (<60s) · "X phút trước" · "X giờ trước" · "Hôm qua, HH:mm" · "HH:mm dd/MM".
 * Used by device cards ("Cập nhật: ...") and on/off history time column.
 */
export function formatRelativeTime(value: DateTimeString, now: Date = new Date()): string {
  const d = parseDateTime(value)
  if (Number.isNaN(d.getTime())) return value
  const diffMs = now.getTime() - d.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24 && d.getDate() === now.getDate()) return `${hours} giờ trước`
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear()) {
    return `Hôm qua, ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}
