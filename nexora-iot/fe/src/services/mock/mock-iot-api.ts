import { readToken } from '@/auth/token-store'
import { ApiError } from '@/services/api-error'
import { timeMatches } from '@/utils/format-datetime'
import type {
  ChartData,
  ChartQuery,
  ControlInput,
  ControlResult,
  Device,
  DeviceAction,
  DeviceHistoryQuery,
  LoginResponse,
  Paged,
  ProfileUpdate,
  SensorHistoryQuery,
  SensorInfo,
  SensorReading,
  SensorSearchKind,
  User,
} from '@/types/iot'
import type { IotApi } from '@/services/iot-api'
import { MockAuthStore } from './mock-auth-store'
import { ALL_DEVICE_IDS } from './mock-engine'
import { getSimulator } from './mock-simulator'

/** Small network-latency simulation. */
const delay = (ms = 150): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** In-memory pagination over a pre-filtered, sorted row list. */
function paginate<T>(rows: T[], page = 1, limit = 20): Paged<T> {
  const start = (page - 1) * limit
  return { items: rows.slice(start, start + limit), page, limit, total: rows.length }
}

/** "yyyy-MM-dd HH:mm:ss" compares lexicographically === chronologically. */
const byTimeDesc = <T extends { time: string }>(a: T, b: T): number => b.time.localeCompare(a.time)

/** Spec khóa sensors_id: 1 Nhiệt độ, 2 Độ ẩm, 3 Ánh sáng. */
const SENSOR_KIND: Record<number, Exclude<SensorSearchKind, 'all' | 'time'>> = {
  1: 'temp',
  2: 'humid',
  3: 'light',
}

/**
 * Search toàn log theo loại giá trị: "25" + nhiệt độ → 25.1, 25.23 (prefix
 * match); time → contains ở cả 2 định dạng; all → giá trị/tên/ID/thời gian.
 */
function matchesSearch(
  row: SensorReading,
  kind: SensorSearchKind,
  needle: string,
  sensorNames: Map<number, string>,
): boolean {
  if (kind !== 'all' && kind !== 'time' && SENSOR_KIND[row.sensors_id] !== kind) return false
  if (!needle) return true
  if (kind === 'time') return timeMatches(row.time, needle)
  if (kind === 'all') {
    const name = (sensorNames.get(row.sensors_id) ?? '').toLowerCase()
    return (
      String(row.value).startsWith(needle) ||
      name.includes(needle) ||
      String(row.id).includes(needle) ||
      timeMatches(row.time, needle)
    )
  }
  return String(row.value).startsWith(needle)
}

/**
 * MockIotApi — IotApi over MockSimulator. Query/filter/pagination logic lives
 * here; the simulator only owns state + timing. Auth calls read the token from
 * token-store exactly like the future HttpIotApi (Authorization header) will.
 */
export class MockIotApi implements IotApi {
  private auth = new MockAuthStore()
  private sim = getSimulator()

  private requireToken(): string {
    const token = readToken()
    if (!token) throw new ApiError(401, 'Chưa đăng nhập')
    return token
  }

  // ---- Auth ----

  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    await delay(400)
    return this.auth.login(usernameOrEmail, password)
  }

  async logout(): Promise<void> {
    const token = readToken()
    if (token) this.auth.logout(token)
    await delay(100)
  }

  async getCurrentUser(): Promise<User> {
    await delay(120)
    return this.auth.getUser(this.requireToken())
  }

  async updateProfile(patch: ProfileUpdate): Promise<User> {
    const token = this.requireToken()
    await delay(300)
    this.auth.getUser(token) // validate session
    return this.auth.updateProfile(patch)
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const token = this.requireToken()
    await delay(300)
    this.auth.getUser(token)
    this.auth.changePassword(oldPassword, newPassword)
  }

  // ---- Sensors ----

  async getLatestSensorData(limit = 1): Promise<SensorReading[]> {
    await delay()
    const taken = new Map<number, number>()
    const out: SensorReading[] = []
    for (const r of this.sim.sensorLog().sort(byTimeDesc)) {
      const n = taken.get(r.sensors_id) ?? 0
      if (n < limit) {
        taken.set(r.sensors_id, n + 1)
        out.push(r)
      }
    }
    return out
  }

  async getSensorChart(query: ChartQuery): Promise<ChartData> {
    await delay()
    return this.sim
      .sensorLog()
      .filter((r) => r.sensors_id === query.sensorId && (!query.from || r.time >= query.from))
      .slice(-(query.limit ?? 200))
      .map((r) => ({ time: r.time, value: r.value }))
  }

  async getSensors(): Promise<SensorInfo[]> {
    await delay()
    return this.sim.sensors()
  }

  async getSensorHistory(query: SensorHistoryQuery): Promise<Paged<SensorReading>> {
    await delay()
    const kind = query.search_kind ?? 'all'
    const needle = (query.search ?? '').trim().toLowerCase()
    const sensorNames = new Map(this.sim.sensors().map((s) => [s.sensors_id, s.sensors_name]))
    const rows = this.sim
      .sensorLog()
      .filter(
        (r) =>
          (query.sensors_id === undefined || r.sensors_id === query.sensors_id) &&
          (!query.from || r.time >= query.from) &&
          (!query.to || r.time <= query.to) &&
          matchesSearch(r, kind, needle, sensorNames),
      )
      .sort(byTimeDesc)
    return paginate(rows, query.page, query.limit)
  }

  // ---- Devices ----

  async getDevices(): Promise<Device[]> {
    await delay()
    return this.sim.devicesSnapshot()
  }

  async controlDevice(input: ControlInput): Promise<ControlResult[]> {
    const token = this.requireToken()
    const user = this.auth.getUser(token)
    const ids =
      input.all !== undefined
        ? [...ALL_DEVICE_IDS]
        : input.deviceId !== undefined
          ? [input.deviceId]
          : []
    if (ids.length === 0) throw new ApiError(400, 'Thiếu thiết bị cần điều khiển')
    const action = input.all ?? input.action
    const confirmed = await this.sim.control(user.fullname, ids, action)
    return confirmed.map((d) => ({
      devices_id: d.devices_id,
      devices_name: d.devices_name,
      status: d.status,
    }))
  }

  async getDeviceHistory(query: DeviceHistoryQuery): Promise<Paged<DeviceAction>> {
    await delay()
    const needle = (query.search ?? '').trim().toLowerCase()
    const rows = this.sim
      .actionLog()
      .filter(
        (a) =>
          (query.device_id === undefined || a.devices_id === query.device_id) &&
          (query.action === undefined || a.action === query.action) &&
          (query.status === undefined || a.status === query.status) &&
          (!query.from || a.time >= query.from) &&
          (!query.to || a.time <= query.to) &&
          (!needle || timeMatches(a.time, needle)),
      )
      .sort(byTimeDesc)
    return paginate(rows, query.page, query.limit)
  }

  // ---- Realtime ----

  onSensorData(cb: (readings: SensorReading[]) => void): () => void {
    return this.sim.onSensorData(cb)
  }

  onDeviceStatus(cb: (devices: Device[]) => void): () => void {
    return this.sim.onDeviceStatus(cb)
  }
}
