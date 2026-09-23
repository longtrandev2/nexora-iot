import { useState } from 'react'
import type { Device, ToggleAction } from '@/types/iot'

interface LedStatusCardProps {
  device: Device
  onToggle: (deviceId: number, action: ToggleAction) => Promise<void> | void
}

/**
 * Compact LED card (dashboard "Điều khiển chiếu sáng"): icon fill reflects
 * state, toggle fires onToggle, disabled while a command is in flight (E3).
 */
export function LedStatusCard({ device, onToggle }: LedStatusCardProps) {
  const [pendingTarget, setPendingTarget] = useState<ToggleAction | null>(null)
  const busy = device.status === 'loading'
  // Optimistic visual: while pending, show the target state the user picked.
  const isOn = pendingTarget !== null ? pendingTarget === 'on' : device.status === 'on'

  const handleToggle = async (next: ToggleAction): Promise<void> => {
    if (busy) return // E3: reject new command while this device is loading
    setPendingTarget(next)
    try {
      await onToggle(device.devices_id, next)
    } finally {
      setPendingTarget(null)
    }
  }

  const iconClasses = isOn
    ? 'border-secondary-container bg-secondary-container/20 text-secondary'
    : 'border-outline-variant bg-surface-container-high text-outline'

  return (
    <div className="group flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-container-padding transition-shadow hover:shadow-card-hover">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg border transition-colors ${iconClasses}`}>
          <span className="material-symbols-outlined" data-weight={isOn ? 'fill' : undefined}>
            lightbulb
          </span>
        </div>
        <div>
          <h4 className="mb-1 font-title-sm text-title-sm text-on-surface">{device.devices_name}</h4>
          <div className="flex items-center gap-2">
            <span className="rounded bg-surface-container-low px-2 py-0.5 font-label-caps text-label-caps text-outline">
              {device.devices_id}
            </span>
            <span className="flex items-center gap-1 font-label-caps text-label-caps text-secondary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" /> Online
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <label className={`relative inline-flex cursor-pointer items-center ${busy ? 'cursor-not-allowed opacity-60' : ''}`}>
          <input
            type="checkbox"
            className="toggle-checkbox peer sr-only"
            checked={isOn}
            disabled={busy}
            onChange={(e) => void handleToggle(e.target.checked ? 'on' : 'off')}
          />
          <div className="toggle-label relative h-6 w-11 rounded-full bg-outline-variant transition-colors peer-focus:ring-2 peer-focus:ring-primary/30">
            <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full border border-outline bg-white transition-transform duration-200 ease-in-out" />
          </div>
        </label>
        <span className={`font-label-caps text-label-caps ${busy ? 'text-on-surface-variant' : isOn ? 'text-primary' : 'text-outline-variant'}`}>
          {busy ? '...' : isOn ? 'BẬT' : 'TẮT'}
        </span>
      </div>
    </div>
  )
}
