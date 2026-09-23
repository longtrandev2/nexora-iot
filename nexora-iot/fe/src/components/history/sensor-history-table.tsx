import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatDateTimeDisplay } from '@/utils/format-datetime'
import { SENSOR_DISPLAY, sensorStatus } from '@/utils/sensor-styling'
import type { SensorInfo, SensorReading } from '@/types/iot'

const HEAD = ['ID', 'TÊN CẢM BIẾN', 'GIÁ TRỊ', 'ĐƠN VỊ', 'THỜI GIAN GHI NHẬN', 'TRẠNG THÁI']

/** Sensor log table (API-07 rows); status badge is FE-computed (thresholds). */
export function SensorHistoryTable({ rows, sensors }: { rows: SensorReading[]; sensors: SensorInfo[] }) {
  if (rows.length === 0) return <EmptyState icon="search_off" />
  const sensorById = new Map(sensors.map((s) => [s.sensors_id, s]))

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-high">
            {HEAD.map((h, i) => (
              <th key={h} className={`px-6 py-4 font-label-caps text-label-caps text-on-surface-variant ${i === 2 ? 'text-right' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
          {rows.map((row) => {
            const sensor = sensorById.get(row.sensors_id)
            const display = SENSOR_DISPLAY[row.sensors_id]
            const status = sensorStatus(row.sensors_id, row.value)
            return (
              <tr key={row.id} className="transition-colors hover:bg-primary/5">
                <td className="px-6 py-4 font-semibold text-on-surface">{row.id}</td>
                <td className="flex items-center gap-2 px-6 py-4 text-on-surface-variant">
                  {display ? <span className="material-symbols-outlined text-sm text-outline">{display.icon}</span> : null}
                  {sensor?.sensors_name ?? `Cảm biến ${row.sensors_id}`}
                </td>
                <td className="px-6 py-4 text-right font-display-metrics text-2xl text-on-surface">
                  {row.value === -1 ? '--' : row.value}
                </td>
                <td className="px-6 py-4 text-outline">{sensor?.unit ?? ''}</td>
                <td className="whitespace-nowrap px-6 py-4 text-on-surface-variant">{formatDateTimeDisplay(row.time)}</td>
                <td className="px-6 py-4">
                  <StatusBadge tone={status.tone === 'normal' ? 'normal' : status.tone === 'high' ? 'high' : 'none'} label={status.label} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
