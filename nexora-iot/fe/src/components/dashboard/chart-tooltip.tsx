/**
 * Dark pill tooltip for the realtime chart (design "27.1°C" style).
 * Single series → big bold value + unit; "Tất cả" mode → one colored row
 * per sensor, shared time caption at the bottom.
 */

/** Chart point: epoch ms + per-sensor values keyed by sensors_id (-1 gaps filtered). */
export type ChartRow = { t: number } & { [sensorId: number]: number | undefined }

/** Tooltip lookup: sensors_id → display name, unit, line color. */
export type ChartMeta = Map<number, { name: string; unit: string; color: string }>

const pad = (n: number): string => String(n).padStart(2, '0')

export function ChartTooltip({
  active,
  payload,
  meta,
}: {
  active?: boolean
  payload?: Array<{ dataKey?: number | string; value?: number; payload?: ChartRow }>
  meta: ChartMeta
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null

  // Keep only series we can label (recharts passes one entry per rendered Area).
  const entries = payload.flatMap((p) => {
    if (typeof p.dataKey !== 'number' || typeof p.value !== 'number') return []
    const m = meta.get(p.dataKey)
    return m === undefined ? [] : [{ m, value: p.value }]
  })
  if (entries.length === 0) return null

  const multi = entries.length > 1
  const d = new Date(point.t)
  return (
    <div className="rounded-md bg-inverse-surface px-3 py-2 text-center font-body-md text-body-md text-white shadow-lg">
      {entries.map((e) => (
        <div key={e.m.name} className="font-bold">
          {multi && (
            <>
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ backgroundColor: e.m.color }} />
              <span className="mr-1 font-medium">{e.m.name}</span>
            </>
          )}
          {e.value}
          {e.m.unit}
        </div>
      ))}
      <div className="opacity-70">
        {pad(d.getHours())}:{pad(d.getMinutes())} {pad(d.getDate())}/{pad(d.getMonth() + 1)}
      </div>
    </div>
  )
}
