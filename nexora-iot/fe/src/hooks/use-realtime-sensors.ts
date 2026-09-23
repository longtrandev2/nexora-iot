import { useEffect, useRef, useState } from 'react'
import { toast } from '@/components/ui/toast'
import { useIotApi } from '@/services/iot-api-context'
import type { SensorInfo, SensorReading } from '@/types/iot'

/** Points kept per sensor for card sparkline + trend (≈ last 24s). */
const CARD_HISTORY = 12
/** Spec E1/E2: no tick for 30s → error toast, keep last values. */
const STALE_AFTER_MS = 30_000

export interface RealtimeSensors {
  sensors: SensorInfo[]
  /** Per-sensor tail, oldest → newest (≤ CARD_HISTORY points, gaps kept). */
  readings: Record<number, SensorReading[]>
}

/**
 * Live sensor feed for the dashboard cards: initial getLatestSensorData +
 * onSensorData subscription (2s tick). Also watches tick freshness (E1/E2).
 */
export function useRealtimeSensors(): RealtimeSensors {
  const api = useIotApi()
  const [sensors, setSensors] = useState<SensorInfo[]>([])
  const [readings, setReadings] = useState<Record<number, SensorReading[]>>({})
  const lastTickRef = useRef<number>(Date.now())
  const staleToastedRef = useRef<boolean>(false)

  useEffect(() => {
    let cancelled = false
    api
      .getSensors()
      .then((rows) => !cancelled && setSensors(rows))
      .catch(() => toast('Không tải được danh sách cảm biến', 'error'))
    api
      .getLatestSensorData(CARD_HISTORY)
      .then((rows) => {
        if (cancelled) return
        setReadings(groupBySensor(rows, CARD_HISTORY))
      })
      .catch(() => toast('Không lấy được dữ liệu cảm biến', 'error'))
    const unsubscribe = api.onSensorData((tick) => {
      lastTickRef.current = Date.now()
      staleToastedRef.current = false
      setReadings((prev) => appendTick(prev, tick, CARD_HISTORY))
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [api])

  // E1/E2 stale watchdog: toast once per stale period, never drop data.
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastTickRef.current > STALE_AFTER_MS && !staleToastedRef.current) {
        staleToastedRef.current = true
        toast('Không lấy được dữ liệu cảm biến', 'error')
      }
    }, 5_000)
    return () => clearInterval(id)
  }, [])

  return { sensors, readings }
}

/** Newest-first flat list → per-sensor oldest→newest tails. */
function groupBySensor(rows: SensorReading[], limit: number): Record<number, SensorReading[]> {
  const out: Record<number, SensorReading[]> = {}
  for (const row of rows) {
    ;(out[row.sensors_id] ??= []).unshift(row) // rows arrive newest-first
  }
  for (const id of Object.keys(out)) out[Number(id)] = out[Number(id)].slice(0, limit)
  return out
}

/** Append one tick's readings (any sensor) keeping per-sensor tail capped. */
function appendTick(
  prev: Record<number, SensorReading[]>,
  tick: SensorReading[],
  limit: number,
): Record<number, SensorReading[]> {
  const next = { ...prev }
  for (const reading of tick) {
    const tail = [...(next[reading.sensors_id] ?? []), reading]
    next[reading.sensors_id] = tail.slice(-limit)
  }
  return next
}
