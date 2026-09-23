import { useState } from 'react'
import { formatRelativeTime } from '@/utils/format-datetime'
import type { Device, ToggleAction } from '@/types/iot'

interface DeviceControlCardProps {
  device: Device
  onToggle: (deviceId: number, action: ToggleAction) => Promise<void> | void
}

/** Static display code chip per device (Stitch "DEV-LGT-..." pattern). */
export function deviceCode(devicesId: number): string {
  return `DEV-LGT-10${devicesId}`
}

/**
 * Large control card (device-control.html): active = border-primary + glow
 * blob + filled icon; footer shows "Cập nhật: <relative>" + toggle.
 * Optimistic flip while the MQTT confirm round-trip is pending (E3 blocks).
 */
export function DeviceControlCard({ device, onToggle }: DeviceControlCardProps) {
  const [pendingTarget, setPendingTarget] = useState<ToggleAction | null>(null)
  const busy = device.status === 'loading'
  const isOn = pendingTarget !== null ? pendingTarget === 'on' : device.status === 'on'

  const handleToggle = async (next: ToggleAction): Promise<void> => {
    if (busy) return // E3: this device already has a command in flight
    setPendingTarget(next)
    try {
      await onToggle(device.devices_id, next)
    } finally {
      setPendingTarget(null)
    }
  }

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-6 transition-all duration-300 ${
        isOn ? 'border-primary bg-surface' : 'border-outline-variant bg-surface hover:border-primary/50'
      }`}
    >
      {isOn ? (
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-colors group-hover:bg-primary/10" />
      ) : null}

      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg border ${
              isOn ? 'border-primary/20 bg-secondary-container/20' : 'border-outline-variant/50 bg-surface-container-highest'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[28px] ${isOn ? 'text-primary' : 'text-on-surface-variant'}`}
              data-weight={isOn ? 'fill' : undefined}
            >
              lightbulb
            </span>
          </div>
          <div>
            <h3 className="font-title-sm text-title-sm text-on-surface">{device.devices_name}</h3>
            <p className="mt-1 font-label-caps text-label-caps text-on-surface-variant">{deviceCode(device.devices_id)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded bg-surface-container-highest px-2 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          <div className={`h-2 w-2 rounded-full bg-primary ${isOn ? 'animate-pulse' : ''}`} />
          Online
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-outline-variant/30 pt-4">
        <span className="font-body-md text-body-md text-on-surface-variant">
          {busy ? 'Đang xử lý...' : `Cập nhật: ${device.updated_at ? formatRelativeTime(device.updated_at) : '--'}`}
        </span>
        <label className={`relative inline-flex cursor-pointer items-center ${busy ? 'cursor-not-allowed opacity-60' : ''}`}>
          <input
            type="checkbox"
            className="toggle-checkbox peer sr-only"
            checked={isOn}
            disabled={busy}
            onChange={(e) => void handleToggle(e.target.checked ? 'on' : 'off')}
          />
          <div className="toggle-label relative h-6 w-11 rounded-full border border-outline-variant/50 bg-surface-container-high transition-colors peer-focus:ring-2 peer-focus:ring-primary/50">
            <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full border border-outline-variant/30 bg-white transition-transform duration-200 ease-in-out" />
          </div>
        </label>
      </div>
    </div>
  )
}
