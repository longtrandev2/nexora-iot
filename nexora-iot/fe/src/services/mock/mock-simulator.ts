import { ApiError } from '@/services/api-error'
import { formatDateTime } from '@/utils/format-datetime'
import type { Device, DeviceAction, DeviceStatus, SensorInfo, SensorReading, ToggleAction } from '@/types/iot'
import {
  BUFFER_MAX,
  CONTROL_CONFIRM_MS,
  CONTROL_FAIL_CHANCE,
  HUMID_ABSENT_CHANCE,
  LIVE_INTERVAL_MS,
  SEED_INTERVAL_MS,
  SEED_TICKS,
  SENSORS,
  createRng,
  walk,
} from './mock-engine'

/**
 * MockSimulator — mimics the REAL system's MQTT behavior:
 *  - sensor_data every 2s (seeded 24h backfill, 2000 pts/sensor ring buffer)
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
    this.start()
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
        if (this.rng() < CONTROL_FAIL_CHANCE) {
          deviceIds.forEach((id) => this.setDevice(id, prev.get(id) ?? 'off'))
          this.emitDevices()
          reject(new ApiError(504, 'Thiết bị không phản hồi'))
          return
        }
        const time = formatDateTime(new Date())
        const confirmed = deviceIds.map((id) => {
          this.setDevice(id, action, time)
          this.actions.push({
            id: this.nextActionId++,
            devices_id: id,
            devices_name: `LED ${id}`,
            action,
            status: action,
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
    for (let i = SEED_TICKS; i >= 1; i--) {
      this.nextReadings(new Date(now - i * SEED_INTERVAL_MS))
    }
  }

  private seedDeviceActions(): void {
    const now = Date.now()
    let minutesAgo = 10 + this.rng() * 50
    for (let i = 0; i < 40; i++) {
      const id = 1 + Math.floor(this.rng() * 3)
      const action: ToggleAction = this.rng() < 0.5 ? 'on' : 'off'
      const time = formatDateTime(new Date(now - minutesAgo * 60000))
      this.actions.push({
        id: this.nextActionId++,
        devices_id: id,
        devices_name: `LED ${id}`,
        action,
        status: action,
        user_id: 1,
        user_name: 'Trần Khắc Long',
        time,
      })
      minutesAgo += 10 + this.rng() * 50
    }
    // Replay oldest→newest so each device's final status/updated_at comes
    // from its NEWEST action (array is newest-first).
    for (let i = this.actions.length - 1; i >= 0; i--) {
      const a = this.actions[i]
      this.setDevice(a.devices_id, a.status, a.time)
    }
  }
}

/** Singleton (survives StrictMode double-mount + HMR re-eval; one timer only). */
const globalRef = globalThis as { __nexoraMockSimulator?: MockSimulator }

export function getSimulator(): MockSimulator {
  globalRef.__nexoraMockSimulator ??= new MockSimulator()
  return globalRef.__nexoraMockSimulator
}
