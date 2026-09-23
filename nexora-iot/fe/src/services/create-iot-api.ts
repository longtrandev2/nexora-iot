import { apiMode } from '@/config/env'
import type { IotApi } from './iot-api'
import { MockIotApi } from './mock/mock-iot-api'

/**
 * Adapter factory: env decides the concrete IotApi. Called exactly once by
 * IotApiProvider so the app shares a single instance (and simulator timer).
 */
export function createIotApi(): IotApi {
  if (apiMode === 'http') {
    // HttpIotApi lands in phase 08 (REST + STOMP). Fail loudly, not silently.
    throw new Error('HttpIotApi not implemented yet — set VITE_API_MODE=mock')
  }
  return new MockIotApi()
}
