import { useEffect, useState } from 'react'
import { DeviceAllControls } from '@/components/devices/device-all-controls'
import { DeviceControlCard } from '@/components/devices/device-control-card'
import { PageHeader } from '@/components/ui/page-header'
import { useRealtimeDevices } from '@/hooks/use-realtime-devices'
import type { ToggleAction } from '@/types/iot'

/** Điều khiển thiết bị (UC03): per-device toggles + bulk on/off + refresh. */
export function DeviceControlPage() {
  const { devices, busy, control, controlAll, refresh } = useRealtimeDevices()
  const [refreshing, setRefreshing] = useState(false)
  // Nudge re-render every 30s so "Cập nhật: X phút trước" labels stay fresh.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const handleAll = (action: ToggleAction): void => {
    if (busy) return
    void controlAll(action)
  }

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Điều khiển thiết bị"
        subtitle="Quản lý trạng thái ba đèn LED trong hệ thống."
        actions={
          <DeviceAllControls busy={busy} refreshing={refreshing} onAll={handleAll} onRefresh={() => void handleRefresh()} />
        }
      />

      <div className="grid auto-rows-fr grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => (
          <DeviceControlCard key={device.devices_id} device={device} onToggle={control} />
        ))}
      </div>
    </>
  )
}
