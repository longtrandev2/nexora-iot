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
 * Used by device cards ("Cập nhật: ...").
 */
export function formatRelativeTime(value: DateTimeString, now: Date = new Date()): string {
  const d = parseDateTime(value)
  if (Number.isNaN(d.getTime())) return value
  const diffMs = now.getTime() - d.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  return formatHistoryTime(value, now)
}

/**
 * "yyyy-MM-dd HH:mm:ss" → history table label:
 * "Hôm nay, HH:mm" · "Hôm qua, HH:mm" · "HH:mm dd/MM".
 */
export function formatHistoryTime(value: DateTimeString, now: Date = new Date()): string {
  const d = parseDateTime(value)
  if (Number.isNaN(d.getTime())) return value
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  const sameDay = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  if (sameDay) return `Hôm nay, ${hm}`
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear()) {
    return `Hôm qua, ${hm}`
  }
  return `${hm} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}

/** datetime-local input value ("yyyy-MM-ddTHH:mm[:ss]") → spec "yyyy-MM-dd HH:mm:ss". */
export function fromDatetimeLocal(local: string): DateTimeString | undefined {
  const trimmed = local.trim()
  if (!trimmed) return undefined
  const normalized = trimmed.length === 16 ? `${trimmed}:00` : trimmed
  return normalized.replace('T', ' ')
}
