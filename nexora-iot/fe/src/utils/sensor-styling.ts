/**
 * Single source of truth for per-sensor visuals + FE-computed thresholds
 * (dashboard cards, chart, history status badges all reuse this).
 * Colors mirror the Stitch palette (error=LM35, primary=DHT11, tertiary=LDR).
 */

export interface SensorDisplayConfig {
  icon: string
  /** Chart stroke / sparkline color (raw hex for SVG). */
  color: string
  /** Icon circle tint classes. */
  iconClasses: string
  /** Card hover gradient origin classes. */
  hoverGradient: string
}

export const SENSOR_DISPLAY: Record<number, SensorDisplayConfig> = {
  1: {
    icon: 'device_thermostat',
    color: '#ba1a1a',
    iconClasses: 'bg-error-container/30 text-error',
    hoverGradient: 'from-error-container/10',
  },
  2: {
    icon: 'humidity_percentage',
    color: '#004ac6',
    iconClasses: 'bg-primary-container/20 text-primary',
    hoverGradient: 'from-primary-container/5',
  },
  3: {
    icon: 'light_mode',
    color: '#3e3fcc',
    iconClasses: 'bg-tertiary-container/20 text-tertiary',
    hoverGradient: 'from-tertiary-container/10',
  },
  4: {
    icon: 'rainy',
    color: '#0e7490',
    iconClasses: 'bg-[#0e7490]/10 text-[#0e7490]',
    hoverGradient: 'from-[#0e7490]/10',
  },
}

/** sensors_id of "Độ mưa" — its status uses the user-set threshold instead of a fixed one. */
export const RAIN_SENSOR_ID = 4
export const DEFAULT_RAIN_THRESHOLD = 70

export type SensorTone = 'normal' | 'high' | 'none'

export interface SensorStatus {
  label: string
  tone: SensorTone
}

/**
 * FE-computed status pill (locked thresholds): temp ≥ 35 °C or light ≥ 80 %
 * → "Cao"; rain ≥ rainThreshold → "Vượt ngưỡng"; humid -1 (DHT11 absent)
 * → "Không có dữ liệu"; else "Bình thường".
 */
export function sensorStatus(
  sensorsId: number,
  value: number | undefined,
  rainThreshold: number = DEFAULT_RAIN_THRESHOLD,
): SensorStatus {
  if (value === undefined || value === -1) return { label: 'Không có dữ liệu', tone: 'none' }
  if (sensorsId === RAIN_SENSOR_ID && value >= rainThreshold) return { label: 'Vượt ngưỡng', tone: 'high' }
  if ((sensorsId === 1 && value >= 35) || (sensorsId === 3 && value >= 80)) {
    return { label: 'Cao', tone: 'high' }
  }
  return { label: 'Bình thường', tone: 'normal' }
}

export interface SensorTrend {
  dir: 'up' | 'down'
  /** Absolute % change, ready for display. */
  pct: number
}

/** % change of the newest value vs its predecessor (skips -1 gaps). */
export function calcTrend(series: number[]): SensorTrend | null {
  const vals = series.filter((v) => v !== -1)
  if (vals.length < 2) return null
  const prev = vals[vals.length - 2]
  const last = vals[vals.length - 1]
  if (prev <= 0) return null
  const pct = Math.abs(((last - prev) / prev) * 100)
  if (pct < 0.05) return null
  return { dir: last > prev ? 'up' : 'down', pct }
}
