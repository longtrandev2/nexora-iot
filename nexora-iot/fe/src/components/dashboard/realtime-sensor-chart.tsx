import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useIotApi } from '@/services/iot-api-context'
import { formatDateTime, parseDateTime } from '@/utils/format-datetime'
import { SENSOR_DISPLAY } from '@/utils/sensor-styling'
import type { SensorInfo } from '@/types/iot'
import { ChartTooltip } from './chart-tooltip'
import type { ChartMeta, ChartRow } from './chart-tooltip'

/** Select value: one sensors_id, or 'all' to overlay every sensor. */
type SensorFilter = number | 'all'

const RANGES = [
  { key: '1h', label: '1h', ms: 3600_000 },
  { key: '6h', label: '6h', ms: 6 * 3600_000 },
  { key: '24h', label: '24h', ms: 24 * 3600_000 },
  { key: '7d', label: '7d', ms: 7 * 24 * 3600_000 },
] as const

type RangeKey = (typeof RANGES)[number]['key']
const MAX_POINTS = 200
const pad = (n: number): string => String(n).padStart(2, '0')

/**
 * Realtime area chart: initial getSensorChart window per (filter, range),
 * then live appends from the 2s onSensorData tick (UC02 "no reload").
 * Filter "Tất cả" overlays all 3 sensors on one chart — first series uses the
 * left axis, the rest share the right axis (°C vs % scales differ).
 */
export function RealtimeSensorChart({ sensors }: { sensors: SensorInfo[] }) {
  const api = useIotApi()
  const [filter, setFilter] = useState<SensorFilter>(sensors[0]?.sensors_id ?? 1)
  const [rangeKey, setRangeKey] = useState<RangeKey>('6h')
  const [rows, setRows] = useState<ChartRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const range = RANGES.find((r) => r.key === rangeKey)!
  const isAll = filter === 'all'
  const active = isAll ? sensors : sensors.filter((s) => s.sensors_id === filter)
  // Stable effect dep: sensors arrives async, array identity changes per tick.
  const idsKey = active.map((s) => s.sensors_id).join(',')

  const colorOf = (id: number): string => SENSOR_DISPLAY[id]?.color ?? '#004ac6'
  const meta = useMemo<ChartMeta>(
    () =>
      new Map(
        sensors.map((s) => [
          s.sensors_id,
          { name: s.sensors_name, unit: s.unit, color: colorOf(s.sensors_id) },
        ]),
      ),
    [sensors],
  )

  // Initial fetch whenever filter or range changes: one call per active sensor,
  // merged into one row per timestamp (simulator ticks share the same time).
  useEffect(() => {
    let cancelled = false
    const ids = idsKey.split(',').map(Number)
    const from = formatDateTime(new Date(Date.now() - range.ms))
    setLoading(true)
    // Clear stale rows so live ticks of the new filter don't merge with the
    // previous series while the fetch is in flight.
    setRows([])
    Promise.all(
      ids.map((id) =>
        api
          .getSensorChart({ sensorId: id, from, limit: MAX_POINTS })
          .then((data) =>
            data
              .filter((p) => p.value !== -1)
              .map((p) => ({ t: parseDateTime(p.time).getTime(), [id]: p.value })),
          ),
      ),
    ).then((series) => {
      if (cancelled) return
      const byT = new Map<number, ChartRow>()
      for (const points of series) {
        for (const p of points) {
          const prev = byT.get(p.t)
          byT.set(p.t, prev === undefined ? p : { ...prev, ...p })
        }
      }
      setRows([...byT.values()].sort((a, b) => a.t - b.t))
    })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [api, idsKey, range.ms])

  // Live tail: append matching ticks (fill into the row of their timestamp),
  // trim to window + point cap.
  useEffect(() => {
    const wanted = new Set(idsKey.split(',').map(Number))
    return api.onSensorData((tick) => {
      const windowStart = Date.now() - range.ms
      setRows((prev) => {
        const byT = new Map(prev.map((r) => [r.t, r]))
        for (const r of tick) {
          if (!wanted.has(r.sensors_id) || r.value === -1) continue
          const t = parseDateTime(r.time).getTime()
          const row = byT.get(t)
          byT.set(t, row === undefined ? { t, [r.sensors_id]: r.value } : { ...row, [r.sensors_id]: r.value })
        }
        return [...byT.values()]
          .sort((a, b) => a.t - b.t)
          .filter((p) => p.t >= windowStart)
          .slice(-MAX_POINTS)
      })
    })
  }, [api, idsKey, range.ms])

  const fmtTick = (t: number): string => {
    const d = new Date(t)
    return rangeKey === '7d'
      ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
      : `${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <div className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-4 md:h-full">
      <div className="mb-2 flex shrink-0 flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h3 className="font-headline-md text-headline-md text-on-background">Dữ liệu cảm biến</h3>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative w-48">
            <select
              value={isAll ? 'all' : String(filter)}
              onChange={(e) => setFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-1.5 font-title-sm text-title-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Tất cả</option>
              {sensors.map((s) => (
                <option key={s.sensors_id} value={String(s.sensors_id)}>
                  {s.sensors_name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              expand_more
            </span>
          </div>
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRangeKey(r.key)}
                className={`px-2 py-1 font-label-caps text-label-caps transition-colors ${
                  r.key === rangeKey
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Colored legend — overlay mode only (matches the sensor cards). */}
      {isAll && (
        <div className="mb-1 flex shrink-0 flex-wrap gap-4 px-1">
          {active.map((s) => (
            <span
              key={s.sensors_id}
              className="flex items-center gap-1.5 font-body-md text-body-md text-on-surface-variant"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorOf(s.sensors_id) }} />
              {s.sensors_name}
            </span>
          ))}
        </div>
      )}

      <div className={`h-[300px] w-full transition-opacity md:mt-0 md:h-auto md:min-h-0 md:flex-1 ${loading ? 'opacity-40' : 'opacity-100'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: isAll ? 48 : 8, bottom: 0, left: 0 }}>
            <defs>
              {active.map((s) => (
                <linearGradient key={s.sensors_id} id={`chart-grad-${s.sensors_id}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={colorOf(s.sensors_id)} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={colorOf(s.sensors_id)} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="#c3c6d7" strokeDasharray="4 4" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={fmtTick}
              minTickGap={48}
              stroke="#737686"
              tick={{ fill: '#737686', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#c3c6d7' }}
              dy={8}
            />
            <YAxis
              yAxisId="left"
              width={40}
              domain={['auto', 'auto']}
              stroke="#737686"
              tick={{ fill: '#737686', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            {isAll && (
              <YAxis
                yAxisId="right"
                orientation="right"
                width={40}
                domain={['auto', 'auto']}
                stroke="#737686"
                tick={{ fill: '#737686', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
            )}
            <Tooltip content={<ChartTooltip meta={meta} />} />
            {active.map((s, i) => (
              <Area
                key={s.sensors_id}
                type="monotone"
                yAxisId={i === 0 ? 'left' : 'right'}
                dataKey={s.sensors_id}
                name={s.sensors_name}
                stroke={colorOf(s.sensors_id)}
                strokeWidth={3}
                fill={`url(#chart-grad-${s.sensors_id})`}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
