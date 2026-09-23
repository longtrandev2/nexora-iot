import { EmptyState } from '@/components/ui/empty-state'
import { formatHistoryTime } from '@/utils/format-datetime'
import { ACTION_VIEW, DEVICE_STATUS_VIEW, finalStatusView, resultView } from '@/utils/action-view'
import type { DeviceAction } from '@/types/iot'

const HEAD = ['ID', 'THIẾT BỊ', 'NGƯỜI THỰC HIỆN', 'HÀNH ĐỘNG', 'TRẠNG THÁI', 'THỜI GIAN', 'KẾT QUẢ', 'TRẠNG THÁI CUỐI']

/** On/off action log table (API-10 + E-2); Kết quả/Trạng thái cuối derived. */
export function DeviceHistoryTable({ rows }: { rows: DeviceAction[] }) {
  if (rows.length === 0) return <EmptyState icon="search_off" />
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            {HEAD.map((h, i) => (
              <th key={h} className={`px-4 py-3 font-label-caps text-label-caps text-on-surface-variant ${i >= 6 ? 'text-right' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/50 font-body-md text-body-md">
          {rows.map((row) => {
            const action = ACTION_VIEW[row.action]
            const status = DEVICE_STATUS_VIEW[row.status]
            const result = resultView(row.status)
            const final = finalStatusView(row.status)
            return (
              <tr key={row.id} className="transition-colors hover:bg-surface-container-low">
                <td className="px-4 py-4 text-on-surface-variant">{row.id}</td>
                <td className="px-4 py-4 font-title-sm text-title-sm text-on-background">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        row.status === 'on' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                    </div>
                    {row.devices_name}
                  </div>
                </td>
                <td className="px-4 py-4 text-on-surface-variant">{row.user_name}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase ${action.classes}`}>
                    {action.label}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${status.classes}`}>
                    {status.spinning ? (
                      <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                    ) : (
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    )}
                    {status.label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-on-surface-variant">{formatHistoryTime(row.time)}</td>
                <td className="px-4 py-4 text-right">
                  <div className={`flex items-center justify-end gap-1 ${result.classes}`}>
                    <span className="material-symbols-outlined text-[18px]">{result.icon}</span>
                    {result.label}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase ${final.classes}`}>
                    {final.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
