import { apiMode } from '@/config/env'
import { HttpIotApi } from './http/http-iot-api'
import type { IotApi } from './iot-api'
import { MockIotApi } from './mock/mock-iot-api'

/**
 * Adapter factory: env decides the concrete IotApi. Called exactly once by
 * IotApiProvider so the app shares a single instance (and simulator timer / STOMP socket).
 */
export function createIotApi(): IotApi {
  if (apiMode === 'http') return new HttpIotApi()
  return new MockIotApi()
}
