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

/** Chart point: epoch ms + value (-1 humid gaps already filtered). */
interface ChartRow {
  t: number
  value: number
}

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
 * Realtime area chart: initial getSensorChart window per (sensor, range),
 * then live appends from the 2s onSensorData tick (UC02 "no reload").
 */
export function RealtimeSensorChart({ sensors }: { sensors: SensorInfo[] }) {
  const api = useIotApi()
  const [sensorId, setSensorId] = useState<number>(sensors[0]?.sensors_id ?? 1)
  const [rangeKey, setRangeKey] = useState<RangeKey>('6h')
  const [rows, setRows] = useState<ChartRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const range = RANGES.find((r) => r.key === rangeKey)!
  const sensor = sensors.find((s) => s.sensors_id === sensorId)
  const color = SENSOR_DISPLAY[sensorId]?.color ?? '#004ac6'
  const gradientId = `chart-grad-${sensorId}`

  // Initial fetch whenever sensor or range changes.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .getSensorChart({ sensorId, from: formatDateTime(new Date(Date.now() - range.ms)), limit: MAX_POINTS })
      .then((data) => {
        if (cancelled) return
        setRows(
          data
            .filter((p) => p.value !== -1)
            .map((p) => ({ t: parseDateTime(p.time).getTime(), value: p.value })),
        )
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [api, sensorId, range.ms])

  // Live tail: append matching ticks, trim to window + point cap.
  useEffect(() => {
    return api.onSensorData((tick) => {
      const windowStart = Date.now() - range.ms
      setRows((prev) => {
        const next = [...prev]
        for (const r of tick) {
          if (r.sensors_id !== sensorId || r.value === -1) continue
          next.push({ t: parseDateTime(r.time).getTime(), value: r.value })
        }
        return next.filter((p) => p.t >= windowStart).slice(-MAX_POINTS)
      })
    })
  }, [api, sensorId, range.ms])

  const data = useMemo(() => rows, [rows])
  const fmtTick = (t: number): string => {
    const d = new Date(t)
    return rangeKey === '7d' ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` : `${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <div className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-container-padding">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h3 className="font-headline-md text-headline-md text-on-background">Dữ liệu cảm biến</h3>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative w-48">
            <select
              value={sensorId}
              onChange={(e) => setSensorId(Number(e.target.value))}
              className="w-full cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-1.5 font-title-sm text-title-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {sensors.map((s) => (
                <option key={s.sensors_id} value={s.sensors_id}>
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

      <div className={`mt-4 h-[300px] w-full transition-opacity ${loading ? 'opacity-40' : 'opacity-100'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
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
              width={40}
              domain={['auto', 'auto']}
              stroke="#737686"
              tick={{ fill: '#737686', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip unit={sensor?.unit ?? ''} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/** Dark pill tooltip (design "27.1°C" style) with time caption. */
function ChartTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean
  payload?: Array<{ value?: number; payload?: ChartRow }>
  unit: string
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]
  if (point.value === undefined || !point.payload) return null
  const d = new Date(point.payload.t)
  return (
    <div className="rounded-md bg-inverse-surface px-3 py-2 text-center font-body-md text-body-md text-white shadow-lg">
      <div className="font-bold">
        {point.value}
        {unit}
      </div>
      <div className="opacity-70">
        {pad(d.getHours())}:{pad(d.getMinutes())} {pad(d.getDate())}/{pad(d.getMonth() + 1)}
      </div>
    </div>
  )
}
