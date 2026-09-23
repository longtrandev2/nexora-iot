import { useMemo } from 'react'
import { calcTrend, SENSOR_DISPLAY, sensorStatus } from '@/utils/sensor-styling'
import type { SensorInfo, SensorReading } from '@/types/iot'

interface SensorValueCardProps {
  sensor: SensorInfo
  /** Oldest → newest tail (≤12 readings); empty until first load/tick. */
  readings: SensorReading[]
}

/** Metric card per dashboard.html: icon + status pill, big value, trend badge, sparkline. */
export function SensorValueCard({ sensor, readings }: SensorValueCardProps) {
  const display = SENSOR_DISPLAY[sensor.sensors_id]
  const values = useMemo(() => readings.map((r) => r.value), [readings])
  const latest = values.length > 0 ? values[values.length - 1] : undefined
  const hasData = latest !== undefined && latest !== -1
  const status = sensorStatus(sensor.sensors_id, latest)
  const trend = calcTrend(values)

  const pillClasses =
    status.tone === 'high'
      ? 'bg-error-container/30 border-error/20 text-error'
      : 'bg-surface-container-low border-outline-variant text-on-surface-variant'
  const dotClasses = status.tone === 'high' ? 'bg-error' : status.tone === 'none' ? 'bg-outline' : 'bg-secondary'
  const trendClasses =
    trend?.dir === 'up' ? 'text-error bg-error-container/50' : 'text-secondary bg-secondary-container/50'

  return (
    <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-container-padding transition-shadow duration-300 hover:shadow-card-hover">
      <div
        className={`absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${display.hoverGradient}`}
      />
      <div className="relative z-10 mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${display.iconClasses}`}>
            <span className="material-symbols-outlined">{display.icon}</span>
          </div>
          <div>
            <h3 className="font-title-sm text-title-sm text-on-surface">{sensor.sensors_name}</h3>
            <span
              className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-label-caps text-label-caps ${pillClasses}`}
            >
              <span className={`h-2 w-2 rounded-full ${dotClasses}`} /> {status.label}
            </span>
          </div>
        </div>
      </div>
      <div className="relative z-10 mb-4 flex items-baseline gap-3">
        <span className="font-display-metrics text-display-metrics tracking-tight text-on-background">
          {hasData ? latest : '--'}{' '}
          <span className="text-2xl font-normal text-on-surface-variant">{sensor.unit}</span>
        </span>
        {trend ? (
          <span className={`flex items-center rounded-md px-2 py-1 font-label-caps text-label-caps ${trendClasses}`}>
            <span className="material-symbols-outlined text-[14px]">
              {trend.dir === 'up' ? 'trending_up' : 'trending_down'}
            </span>{' '}
            {trend.dir === 'up' ? '+' : '-'}
            {trend.pct.toFixed(1)}%
          </span>
        ) : null}
      </div>
      <div className="relative z-10 mt-2 h-12 w-full">
        <Sparkline values={values} color={display.color} gradientId={`spark-${sensor.sensors_id}`} />
      </div>
    </div>
  )
}

/** Tiny inline SVG sparkline (skips -1 gaps), design-style gradient fill. */
function Sparkline({ values, color, gradientId }: { values: number[]; color: string; gradientId: string }) {
  const paths = useMemo(() => sparkPaths(values), [values])
  if (!paths) return <div className="h-full w-full" />
  return (
    <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 30">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={paths.area} fill={`url(#${gradientId})`} />
      <path
        d={paths.line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function sparkPaths(raw: number[]): { line: string; area: string } | null {
  const values = raw.filter((v) => v !== -1)
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100
    const y = 27 - ((v - min) / span) * 24 // map into [3, 27]
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
  })
  const line = points.join(' ')
  return { line, area: `${line} L100 30 L0 30 Z` }
}
