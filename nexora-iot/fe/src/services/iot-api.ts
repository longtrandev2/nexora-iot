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

/**
 * IotApi — the ONLY seam between UI and data (adapter pattern).
 * Pages/hooks consume this interface, never a concrete adapter:
 *   - MockIotApi (default, VITE_API_MODE=mock): simulates real MQTT timing
 *     (2s sensor tick, ~500ms device confirm, humid=-1 gaps).
 *   - HttpIotApi (phase 08, VITE_API_MODE=http): REST + STOMP push.
 *
 * Numbering follows the spec's 12-API contract + E-1..E-5 additions.
 */
export interface IotApi {
  // ---- Auth ----
  /** API-01: accepts username OR email. Throws ApiError(401) on bad creds. */
  login(usernameOrEmail: string, password: string): Promise<LoginResponse>
  /** API-03: trivial BE success; FE clears token regardless. */
  logout(): Promise<void>
  /** API-02: current user from token. Throws ApiError(401) when invalid. */
  getCurrentUser(): Promise<User>
  /** E-4: partial profile update, returns updated user. */
  updateProfile(patch: ProfileUpdate): Promise<User>
  /** E-5: throws ApiError(400) when old password wrong. */
  changePassword(oldPassword: string, newPassword: string): Promise<void>

  // ---- Sensors ----
  /** Latest readings per sensor (newest first), `limit` ticks back each. */
  getLatestSensorData(limit?: number): Promise<SensorReading[]>
  /** Chart window for one sensor, oldest → newest (phase 03). */
  getSensorChart(query: ChartQuery): Promise<ChartData>
  /** Sensor catalog. */
  getSensors(): Promise<SensorInfo[]>
  /** API-07: filtered + paginated sensor log, newest first. */
  getSensorHistory(query: SensorHistoryQuery): Promise<Paged<SensorReading>>

  // ---- Devices ----
  /** API-08: device list incl. live status. */
  getDevices(): Promise<Device[]>
  /** API-09 + E-1: single device or `{all}` bulk; resolves after device_response confirm. */
  controlDevice(input: ControlInput): Promise<ControlResult[]>
  /** API-10 + E-2: filtered + paginated action log, newest first. */
  getDeviceHistory(query: DeviceHistoryQuery): Promise<Paged<DeviceAction>>

  // ---- Realtime subscriptions (WS-push semantics; return unsubscribe fn) ----
  /** Fires every sensor tick (~2s) with that tick's readings. */
  onSensorData(cb: (readings: SensorReading[]) => void): () => void
  /** Fires when any device status changes (loading → confirmed). */
  onDeviceStatus(cb: (devices: Device[]) => void): () => void
}
