import { ApiError } from '@/services/api-error'
import { formatDateTime } from '@/utils/format-datetime'
import type { ActionStatus, Device, DeviceAction, DeviceStatus, SensorInfo, SensorReading, ToggleAction } from '@/types/iot'
import {
  BUFFER_MAX,
  CONTROL_CONFIRM_MS,
  CONTROL_FAIL_CHANCE,
  HUMID_ABSENT_CHANCE,
  LIVE_INTERVAL_MS,
  LIVE_TICKS_ENABLED,
  SEED_TICKS,
  SENSORS,
  createRng,
  walk,
} from './mock-engine'

/**
 * MockSimulator — mimics the REAL system's MQTT behavior:
 *  - sensor_data every 2s (seed ~2 năm thưa + 24h dày, 2000 pts/sensor ring buffer)
 *  - humid = -1 occasionally (DHT11 absent → UI "Không có dữ liệu")
 *  - device_control → 'loading' → ~500ms device_response confirm (5% timeout)
 */
type SensorListener = (readings: SensorReading[]) => void
type DeviceListener = (devices: Device[]) => void

export class MockSimulator {
  private rng = createRng(20260923)
  private values = new Map<number, number>()
  private buffers = new Map<number, SensorReading[]>()
  private devices: Device[] = [1, 2, 3].map((id) => ({ devices_id: id, devices_name: `LED ${id}`, status: 'off' as DeviceStatus, updated_at: '' }))
  private actions: DeviceAction[] = []
  private nextReadingId = 1
  private nextActionId = 1
  private timer: ReturnType<typeof setInterval> | null = null
  private sensorListeners = new Set<SensorListener>()
  private deviceListeners = new Set<DeviceListener>()

  constructor() {
    this.seedSensorHistory()
    this.seedDeviceActions()
    // DEMO FROZEN: skip live 2s ticks — data stands still after seeding.
    if (LIVE_TICKS_ENABLED) this.start()
  }

  // ---------- state snapshots (copies for the adapter) ----------

  sensors(): SensorInfo[] {
    return SENSORS
  }

  devicesSnapshot(): Device[] {
    return this.devices.map((d) => ({ ...d }))
  }

  sensorLog(): SensorReading[] {
    return [...this.buffers.get(1)!, ...this.buffers.get(2)!, ...this.buffers.get(3)!]
  }

  actionLog(): DeviceAction[] {
    return [...this.actions]
  }

  // ---------- realtime subscriptions ----------

  onSensorData(cb: SensorListener): () => void {
    this.sensorListeners.add(cb)
    return () => this.sensorListeners.delete(cb)
  }

  onDeviceStatus(cb: DeviceListener): () => void {
    this.deviceListeners.add(cb)
    return () => this.deviceListeners.delete(cb)
  }

  // ---------- device control (device_control → device_response) ----------

  control(actorName: string, deviceIds: number[], action: ToggleAction): Promise<Device[]> {
    const prev = new Map(this.devices.map((d) => [d.devices_id, d.status]))
    deviceIds.forEach((id) => this.setDevice(id, 'loading'))
    this.emitDevices()
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const time = formatDateTime(new Date())
        if (this.rng() < CONTROL_FAIL_CHANCE) {
          // Timeout: ghi log 'failed', device giữ trạng thái cũ.
          deviceIds.forEach((id) => {
            this.setDevice(id, prev.get(id) ?? 'off')
            this.actions.push({
              id: this.nextActionId++,
              devices_id: id,
              devices_name: `LED ${id}`,
              action,
              status: 'failed',
              user_id: 1,
              user_name: actorName,
              time,
            })
          })
          this.emitDevices()
          reject(new ApiError(504, 'Thiết bị không phản hồi'))
          return
        }
        const confirmed = deviceIds.map((id) => {
          this.setDevice(id, action, time)
          this.actions.push({
            id: this.nextActionId++,
            devices_id: id,
            devices_name: `LED ${id}`,
            action,
            status: 'success',
            user_id: 1,
            user_name: actorName,
            time,
          })
          return this.devices.find((d) => d.devices_id === id)!
        })
        this.emitDevices()
        resolve(confirmed)
      }, CONTROL_CONFIRM_MS)
    })
  }

  // ---------- internals ----------

  private start(): void {
    if (this.timer) return
    this.timer = setInterval(() => {
      const readings = this.nextReadings(new Date())
      if (import.meta.env.DEV) console.debug('[mock] sensor tick', readings)
      this.sensorListeners.forEach((cb) => cb(readings))
    }, LIVE_INTERVAL_MS)
  }

  /** Advance all three sensors one tick and buffer the readings. */
  private nextReadings(at: Date): SensorReading[] {
    const out: SensorReading[] = []
    this.values.set(1, walk(this.rng, this.values.get(1) ?? 28, 24, 33, 0.4))
    out.push(this.push(1, Math.round(this.values.get(1)! * 100) / 100, at))
    if (this.rng() < HUMID_ABSENT_CHANCE) {
      out.push(this.push(2, -1, at)) // DHT11 absent marker
    } else {
      this.values.set(2, walk(this.rng, this.values.get(2) ?? 60, 45, 80, 2))
      out.push(this.push(2, Math.round(this.values.get(2)!), at))
    }
    this.values.set(3, walk(this.rng, this.values.get(3) ?? 55, 0, 100, 5))
    out.push(this.push(3, Math.round(this.values.get(3)!), at))
    return out
  }

  private push(sensorsId: number, value: number, at: Date): SensorReading {
    const reading: SensorReading = {
      id: this.nextReadingId++,
      sensors_id: sensorsId,
      value,
      time: formatDateTime(at),
    }
    const buffer = this.buffers.get(sensorsId) ?? []
    buffer.push(reading)
    if (buffer.length > BUFFER_MAX) buffer.splice(0, buffer.length - BUFFER_MAX)
    this.buffers.set(sensorsId, buffer)
    return reading
  }

  private setDevice(devicesId: number, status: DeviceStatus, time?: string): void {
    const device = this.devices.find((d) => d.devices_id === devicesId)
    if (!device) return
    device.status = status
    device.updated_at = time ?? formatDateTime(new Date())
  }

  private emitDevices(): void {
    const snapshot = this.devicesSnapshot()
    this.deviceListeners.forEach((cb) => cb(snapshot))
  }

  private seedSensorHistory(): void {
    const now = Date.now()
    // Seed đa dạng: 300 điểm rải khắp ~2 năm qua (nhiều năm/tháng khác nhau
    // để search thời gian có kết quả đa dạng)...
    const HIST_TICKS = 300
    const HIST_SPAN_MS = 2 * 365 * 24 * 3600 * 1000
    for (let i = HIST_TICKS; i >= 1; i--) {
      this.nextReadings(new Date(now - (i * HIST_SPAN_MS) / HIST_TICKS))
    }
    // ...+ phần còn lại của buffer dày đặc trong 24h gần đây (chart realtime đẹp).
    const recentTicks = SEED_TICKS - HIST_TICKS
    const recentInterval = Math.floor((24 * 3600 * 1000) / recentTicks)
    for (let i = recentTicks; i >= 1; i--) {
      this.nextReadings(new Date(now - i * recentInterval))
    }
  }

  private seedDeviceActions(): void {
    const now = Date.now()
    let minutesAgo = 10 + this.rng() * 50
    // 3 mục mới nhất ép đủ 3 trạng thái (hiển thị ngay trang 1), còn lại random.
    const FORCED_NEWEST: ActionStatus[] = ['loading', 'failed', 'success']
    for (let i = 0; i < 40; i++) {
      const id = 1 + Math.floor(this.rng() * 3)
      const action: ToggleAction = this.rng() < 0.5 ? 'on' : 'off'
      const roll = this.rng()
      const status: ActionStatus = i < 3 ? FORCED_NEWEST[i] : roll < 0.7 ? 'success' : roll < 0.85 ? 'failed' : 'loading'
      const time = formatDateTime(new Date(now - minutesAgo * 60000))
      this.actions.push({
        id: this.nextActionId++,
        devices_id: id,
        devices_name: `LED ${id}`,
        action,
        status,
        user_id: 1,
        user_name: 'Trần Khắc Long',
        time,
      })
      // Bước nhảy 5–45 ngày → 40 mục rải khắp ~2 năm (đa dạng năm/tháng).
      minutesAgo += (5 + this.rng() * 40) * 24 * 60
    }
    // Replay oldest→newest: chỉ lệnh 'success' mới đổi trạng thái device
    // (failed/loading không ảnh hưởng) → trạng thái cuối = success mới nhất.
    for (let i = this.actions.length - 1; i >= 0; i--) {
      const a = this.actions[i]
      if (a.status === 'success') this.setDevice(a.devices_id, a.action, a.time)
    }
  }
}

/** Singleton (survives StrictMode double-mount + HMR re-eval; one timer only). */
const globalRef = globalThis as { __nexoraMockSimulator?: MockSimulator }

export function getSimulator(): MockSimulator {
  globalRef.__nexoraMockSimulator ??= new MockSimulator()
  return globalRef.__nexoraMockSimulator
}
