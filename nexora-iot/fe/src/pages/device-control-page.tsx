import { useEffect, useState } from 'react'
import { DeviceControlCard } from '@/components/devices/device-control-card'
import { PageHeader } from '@/components/ui/page-header'
import { useRealtimeDevices } from '@/hooks/use-realtime-devices'

/** Điều khiển thiết bị (UC03): per-device toggles (màn ẩn, giữ cho route). */
export function DeviceControlPage() {
  const { devices, control } = useRealtimeDevices()
  // Nudge re-render every 30s so "Cập nhật: X phút trước" labels stay fresh.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <PageHeader title="Điều khiển thiết bị" subtitle="Quản lý trạng thái ba đèn LED trong hệ thống." />

      <div className="grid auto-rows-fr grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => (
          <DeviceControlCard key={device.devices_id} device={device} onToggle={control} />
        ))}
      </div>
    </>
  )
}
