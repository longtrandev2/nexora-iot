import type { SensorInfo } from '@/types/iot'

/**
 * Simulation engine primitives: sensor/device catalog, timing constants
 * (mirroring real MQTT behavior), seeded RNG + random-walk helpers.
 */
export const SENSORS: SensorInfo[] = [
  { sensors_id: 1, sensors_name: 'Nhiệt độ', unit: '°C' },
  { sensors_id: 2, sensors_name: 'Độ ẩm', unit: '%' },
  { sensors_id: 3, sensors_name: 'Ánh sáng', unit: '%' },
]

export const ALL_DEVICE_IDS = [1, 2, 3]

/** Ring-buffer cap per sensor (~2000 pts ≈ 24h seeded + live tail). */
export const BUFFER_MAX = 2000
/** Seed ticks produce ~24h of history at ~43s cadence. */
export const SEED_TICKS = 2000
export const SEED_INTERVAL_MS = Math.floor((24 * 3600 * 1000) / SEED_TICKS)
/** Real ESP32 publishes sensor_data every 2s. */
export const LIVE_INTERVAL_MS = 2000
/** device_response arrives ~500ms after device_control. */
export const CONTROL_CONFIRM_MS = 500
/** DHT11 absent → humid -1 share of ticks. */
export const HUMID_ABSENT_CHANCE = 0.08
/** Simulated device timeout (E1 flow, exercises FE error/revert path). */
export const CONTROL_FAIL_CHANCE = 0.05

/** mulberry32 seeded RNG — deterministic demo data across reloads. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** One random-walk step clamped to [min, max]. */
export function walk(rng: () => number, value: number, min: number, max: number, step: number): number {
  return Math.min(max, Math.max(min, value + (rng() * 2 - 1) * step))
}
