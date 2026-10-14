/**
 * Dashboard chart time ranges + X-axis tick math.
 * The axis always spans [now - range, now]; ticks sit on round local-time marks
 * (every 5 min for 30m, every hour for 6h, at midnight for 7d...).
 */

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export const CHART_RANGES = [
  { key: '30m', label: '30m', ms: 30 * MINUTE, tickMs: 5 * MINUTE },
  { key: '1h', label: '1h', ms: HOUR, tickMs: 10 * MINUTE },
  { key: '6h', label: '6h', ms: 6 * HOUR, tickMs: HOUR },
  { key: '24h', label: '24h', ms: 24 * HOUR, tickMs: 3 * HOUR },
  { key: '7d', label: '7d', ms: 7 * DAY, tickMs: DAY },
] as const

export type ChartRange = (typeof CHART_RANGES)[number]
export type ChartRangeKey = ChartRange['key']

const pad = (n: number): string => String(n).padStart(2, '0')

/** Round local-time tick positions inside [start, end]. */
export function buildTimeTicks(start: number, end: number, tickMs: number): number[] {
  // Shift to local time before rounding so ticks land on local hh:00 / midnight, not UTC.
  const offset = new Date(start).getTimezoneOffset() * MINUTE
  const ticks: number[] = []
  for (let t = Math.ceil((start - offset) / tickMs) * tickMs + offset; t <= end; t += tickMs) {
    ticks.push(t)
  }
  return ticks
}

/** Tick label: "dd/MM" for day ticks, "HH:mm" otherwise. */
export function formatTimeTick(t: number, range: ChartRange): string {
  const d = new Date(t)
  return range.tickMs >= DAY
    ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
    : `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
