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
  User,
} from '@/types/iot'
import type { IotApi } from '@/services/iot-api'
import { apiClient } from './api-client'
import { StompHub, subscribeWithFallback } from './ws-connection'

/** Polling cadence when STOMP is down: sensors like the ESP32 tick, devices less often. */
const SENSOR_POLL_MS = 2_000
const DEVICE_POLL_MS = 10_000

/**
 * HttpIotApi — IotApi over the Spring Boot backend (REST /api/v1 + STOMP /ws).
 * Behavioral twin of MockIotApi: same shapes, same ApiError statuses/messages (BE-provided).
 */
export class HttpIotApi implements IotApi {
  private readonly hub = new StompHub()

  // ---- Auth ----

  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', { username: usernameOrEmail, password })
    return data
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  }

  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  }

  async updateProfile(patch: ProfileUpdate): Promise<User> {
    const { data } = await apiClient.put<User>('/auth/me', patch)
    return data
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.patch('/auth/password', { old_password: oldPassword, new_password: newPassword })
  }

  // ---- Sensors ----

  async getLatestSensorData(limit = 1): Promise<SensorReading[]> {
    const { data } = await apiClient.get<SensorReading[]>('/sensors/data', { params: { limit } })
    return data
  }

  async getSensorChart(query: ChartQuery): Promise<ChartData> {
    const { data } = await apiClient.get<ChartData>('/dashboard/sensors/chart', { params: query })
    return data
  }

  async getSensors(): Promise<SensorInfo[]> {
    const { data } = await apiClient.get<SensorInfo[]>('/sensors')
    return data
  }

  async getSensorHistory(query: SensorHistoryQuery): Promise<Paged<SensorReading>> {
    const { data } = await apiClient.get<Paged<SensorReading>>('/sensors/history', { params: query })
    return data
  }

  // ---- Devices ----

  async getDevices(): Promise<Device[]> {
    const { data } = await apiClient.get<Device[]>('/devices')
    return data
  }

  /** Resolves after the ESP32 confirms; BE answers 504 "Thiết bị không phản hồi" on timeout. */
  async controlDevice(input: ControlInput): Promise<ControlResult[]> {
    const { data } = await apiClient.post<ControlResult[]>('/devices/control', input)
    return data
  }

  async getDeviceHistory(query: DeviceHistoryQuery): Promise<Paged<DeviceAction>> {
    const { data } = await apiClient.get<Paged<DeviceAction>>('/devices/history', { params: query })
    return data
  }

  // ---- Realtime (STOMP push, polling fallback) ----

  onSensorData(cb: (readings: SensorReading[]) => void): () => void {
    let lastId = 0
    const emitNew = (readings: SensorReading[]): void => {
      const fresh = readings.filter((r) => r.id > lastId)
      if (fresh.length === 0) return
      lastId = Math.max(lastId, ...fresh.map((r) => r.id))
      cb(fresh)
    }
    return subscribeWithFallback<SensorReading[]>(
      this.hub,
      '/topic/sensors',
      emitNew,
      () => this.getLatestSensorData(1),
      SENSOR_POLL_MS,
    )
  }

  onDeviceStatus(cb: (devices: Device[]) => void): () => void {
    return subscribeWithFallback<Device[]>(this.hub, '/topic/devices', cb, () => this.getDevices(), DEVICE_POLL_MS)
  }
}
