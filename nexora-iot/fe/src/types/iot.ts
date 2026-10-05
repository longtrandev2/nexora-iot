/**
 * NEXORA IoT domain types — mirror the spec API response shapes exactly
 * (snake_case ids: sensors_id, devices_id; time format "yyyy-MM-dd HH:mm:ss").
 * Pages and adapters speak ONLY these types (see docs/bao-cao-iot-spec.md).
 */

/** LED toggle command / action value as sent by ESP32 payloads. */
export type ToggleAction = 'on' | 'off'

/** Device state: 'loading' = command in flight, not yet confirmed by hardware. */
export type DeviceStatus = 'on' | 'off' | 'loading'

/** Kết quả thực thi 1 lệnh bật/tắt trong log (API-10). */
export type ActionStatus = 'success' | 'failed' | 'loading'

/** User time format everywhere: "yyyy-MM-dd HH:mm:ss" (local time). */
export type DateTimeString = string

// ---------- Auth ----------

export interface User {
  user_id: number
  username: string
  email: string
  fullname: string
  avatar_url: string
  /** 4 liên kết dự án (E-4 mở rộng), editable trong profile modal. */
  github_url: string
  figma_url: string
  postman_url: string
  docs_url: string
  /** Giới thiệu ngắn (E-4 mở rộng). */
  bio: string
}

/** E-4: profile edit modal payload (partial update). */
export interface ProfileUpdate {
  fullname?: string
  email?: string
  username?: string
  avatar_url?: string
  github_url?: string
  figma_url?: string
  postman_url?: string
  docs_url?: string
  bio?: string
}

/** API-01 response body. */
export interface LoginResponse {
  token: string
  user: User
}

// ---------- Sensors ----------

/** Sensor catalog entry (API-06): 1 Nhiệt độ °C, 2 Độ ẩm %, 3 Ánh sáng %. */
export interface SensorInfo {
  sensors_id: number
  sensors_name: string
  unit: string
}

/** One sensor measurement. value = -1 means "no data" (DHT11 absent). */
export interface SensorReading {
  id: number
  sensors_id: number
  value: number
  time: DateTimeString
}

/** Chart query (phase 03): per-sensor window ending "now". */
export interface ChartQuery {
  sensorId: number
  from: DateTimeString
  limit?: number
}

export interface ChartPoint {
  time: DateTimeString
  value: number
}

/** Oldest → newest points for one sensor. */
export type ChartData = ChartPoint[]

/** Loại giá trị định nghĩa cách search lịch sử cảm biến (API-07 search). */
export type SensorSearchKind = 'all' | 'temp' | 'humid' | 'light' | 'time'

/** API-07 query: filter + search toàn log + server-side pagination. */
export interface SensorHistoryQuery {
  page?: number
  limit?: number
  sensors_id?: number
  from?: DateTimeString
  to?: DateTimeString
  /** Chuỗi tìm kiếm (prefix match giá trị, contains thời gian). */
  search?: string
  /** Cách hiểu chuỗi search theo loại giá trị. */
  search_kind?: SensorSearchKind
}

// ---------- Devices ----------

/** API-08 row incl. status/updated_at columns. */
export interface Device {
  devices_id: number
  devices_name: string
  status: DeviceStatus
  updated_at: DateTimeString
}

/** API-10 row (+ user_name per E-2). */
export interface DeviceAction {
  id: number
  devices_id: number
  devices_name: string
  action: ToggleAction
  status: ActionStatus
  user_id: number
  user_name: string
  time: DateTimeString
}

/** API-09 input: single device OR all devices (E-1, maps to `{all:on|off}`). */
export interface ControlInput {
  deviceId?: number
  all?: ToggleAction
  action: ToggleAction
}

/** API-09 confirmed result per device. */
export interface ControlResult {
  devices_id: number
  devices_name: string
  status: DeviceStatus
}

/** API-10 query: filter + search thời gian + server-side pagination. */
export interface DeviceHistoryQuery {
  page?: number
  limit?: number
  device_id?: number
  action?: ToggleAction
  status?: ActionStatus
  from?: DateTimeString
  to?: DateTimeString
  /** Chuỗi tìm kiếm theo thời gian (contains đa định dạng: 2026, 2026/09, 14:3...). */
  search?: string
}

// ---------- Shared ----------

/** Generic paginated envelope for history endpoints. */
export interface Paged<T> {
  items: T[]
  page: number
  limit: number
  total: number
}
