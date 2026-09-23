import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from '@/components/ui/toast'
import { useIotApi } from '@/services/iot-api-context'
import { isApiError } from '@/services/api-error'
import { formatDateTime } from '@/utils/format-datetime'
import type { ControlResult, Device, DeviceStatus, ToggleAction } from '@/types/iot'

export interface RealtimeDevices {
  devices: Device[]
  /** True while any device command is in flight (E3: block overlapping commands). */
  busy: boolean
  control(deviceId: number, action: ToggleAction): Promise<void>
  controlAll(action: ToggleAction): Promise<void>
  refresh(): Promise<void>
}

/**
 * Live device list + control state machine:
 * idle → optimistic 'loading' → confirmed (on/off) | failed (revert + toast).
 * onDeviceStatus events merge last-write-wins per device id (mock pushes
 * 'loading' then the confirmed status, mirroring the real MQTT flow).
 */
export function useRealtimeDevices(): RealtimeDevices {
  const api = useIotApi()
  const [devices, setDevices] = useState<Device[]>([])
  const devicesRef = useRef<Device[]>([])

  const apply = useCallback((next: Device[]): void => {
    devicesRef.current = next
    setDevices(next)
  }, [])

  useEffect(() => {
    let cancelled = false
    api
      .getDevices()
      .then((rows) => !cancelled && apply(rows))
      .catch(() => toast('Không tải được danh sách thiết bị', 'error'))
    const unsubscribe = api.onDeviceStatus((list) => {
      // Merge incoming statuses into current snapshot (last-write-wins).
      const merged = new Map(devicesRef.current.map((d) => [d.devices_id, d]))
      for (const d of list) merged.set(d.devices_id, d)
      apply([...merged.values()].sort((a, b) => a.devices_id - b.devices_id))
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [api, apply])

  const runControl = useCallback(
    async (ids: number[], input: { deviceId?: number; all?: ToggleAction; action: ToggleAction }): Promise<void> => {
      const prev = devicesRef.current
      apply(optimistic(prev, ids, 'loading'))
      try {
        const results = await api.controlDevice(input)
        applyConfirmed(apply, devicesRef.current, results)
        for (const r of results) {
          toast(`${r.devices_name} đã được ${r.status === 'on' ? 'bật' : 'tắt'}.`, 'success')
        }
      } catch (err) {
        apply(revert(devicesRef.current, prev, ids)) // E1: keep prior state on failure/timeout
        const message = isApiError(err) && err.status === 504 ? 'Thiết bị không phản hồi' : controlErrorText(prev, ids)
        toast(message, 'error')
      }
    },
    [api, apply],
  )

  const control = useCallback(
    (deviceId: number, action: ToggleAction): Promise<void> => runControl([deviceId], { deviceId, action }),
    [runControl],
  )

  const controlAll = useCallback(
    (action: ToggleAction): Promise<void> => runControl(deviceIds(devicesRef.current), { all: action, action }),
    [runControl],
  )

  const refresh = useCallback((): Promise<void> => api.getDevices().then(apply).catch(() => toast('Không tải được danh sách thiết bị', 'error')), [api, apply])

  const busy = devices.some((d) => d.status === 'loading')
  return { devices, busy, control, controlAll, refresh }
}

function deviceIds(devices: Device[]): number[] {
  return devices.map((d) => d.devices_id)
}

/** Snapshot with target devices forced into `status` (does not mutate input). */
function optimistic(devices: Device[], ids: number[], status: DeviceStatus): Device[] {
  return devices.map((d) => (ids.includes(d.devices_id) ? { ...d, status } : d))
}

/** Replace confirmed devices from a control response (keeps sort order). */
function applyConfirmed(apply: (d: Device[]) => void, current: Device[], results: ControlResult[]): void {
  const byId = new Map(results.map((r) => [r.devices_id, r]))
  const time = formatDateTime(new Date())
  apply(
    current.map((d) => {
      const r = byId.get(d.devices_id)
      return r ? { ...d, status: r.status, updated_at: time } : d
    }),
  )
}

/** Merge the pre-command statuses of affected ids back into the snapshot. */
function revert(current: Device[], prev: Device[], ids: number[]): Device[] {
  const prevById = new Map(prev.map((d) => [d.devices_id, d]))
  return current.map((d) => (ids.includes(d.devices_id) ? { ...d, ...(prevById.get(d.devices_id) ?? {}) } : d))
}

function controlErrorText(devices: Device[], ids: number[]): string {
  const name = devices.find((d) => d.devices_id === ids[0])?.devices_name ?? 'Thiết bị'
  return `Điều khiển ${name} thất bại.`
}
