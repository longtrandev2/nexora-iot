import { HttpIotApi } from './http/http-iot-api'
import type { IotApi } from './iot-api'

/**
 * Adapter factory: the app always talks to the real backend (REST + STOMP).
 * Called exactly once by IotApiProvider so the app shares a single STOMP socket.
 */
export function createIotApi(): IotApi {
  return new HttpIotApi()
}
