import { LedStatusCard } from '@/components/ui/led-status-card'
import { PageHeader } from '@/components/ui/page-header'
import { RealtimeSensorChart } from '@/components/dashboard/realtime-sensor-chart'
import { SensorValueCard } from '@/components/dashboard/sensor-value-card'
import { useRealtimeDevices } from '@/hooks/use-realtime-devices'
import { useRealtimeSensors } from '@/hooks/use-realtime-sensors'
import type { ToggleAction } from '@/types/iot'

/** Tổng quan (UC02): live sensor cards + realtime chart + LED toggles. */
export function DashboardPage() {
  const { sensors, readings } = useRealtimeSensors()
  const { devices, busy, control, controlAll } = useRealtimeDevices()

  const handleAll = (action: ToggleAction): void => {
    if (busy) return
    void controlAll(action)
  }

  return (
    // Desktop: fit one viewport (header 72 + main padding 24 + pb-20 80 = 176px
    // consumed above/below). Chart flexes to absorb remaining height; smaller
    // screens keep normal scrolling.
    <div className="flex flex-col gap-gutter lg:h-[calc(100dvh-176px)] lg:overflow-hidden">
      <div className="shrink-0">
        <PageHeader
          title="Tổng quan"
          subtitle="Theo dõi dữ liệu cảm biến và trạng thái thiết bị theo thời gian thực."
        />
      </div>

      {/* Sensor summary cards */}
      <div className="grid shrink-0 grid-cols-1 gap-gutter md:grid-cols-3">
        {sensors.map((sensor) => (
          <SensorValueCard key={sensor.sensors_id} sensor={sensor} readings={readings[sensor.sensors_id] ?? []} />
        ))}
      </div>

      {/* Realtime chart — absorbs remaining height on desktop */}
      <div className="min-h-0 lg:flex-1">
        <RealtimeSensorChart sensors={sensors} />
      </div>

      {/* Lighting control section */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-stack-md">
        <h3 className="font-headline-md text-headline-md text-on-background">Điều khiển chiếu sáng</h3>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleAll('on')}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 font-label-caps text-label-caps text-primary transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            BẬT TẤT CẢ
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleAll('off')}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 font-label-caps text-label-caps text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            TẮT TẤT CẢ
          </button>
        </div>
      </div>

      {/* LED status cards */}
      <div className="grid shrink-0 grid-cols-1 gap-gutter md:grid-cols-3">
        {devices.map((device) => (
          <LedStatusCard key={device.devices_id} device={device} onToggle={control} />
        ))}
      </div>
    </div>
  )
}
