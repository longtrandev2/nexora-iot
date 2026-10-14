import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/toast'
import { isApiError } from '@/services/api-error'
import { useIotApi } from '@/services/iot-api-context'
import { DEFAULT_RAIN_THRESHOLD } from '@/utils/sensor-styling'

export interface RainThresholdState {
  /** Current threshold in % (default until the BE answers). */
  threshold: number
  /** Persists a new threshold; resolves true on success (error toast otherwise). */
  save: (value: number) => Promise<boolean>
}

/** Rain warning threshold stored in the BE (GET/PUT /settings/rain-threshold). */
export function useRainThreshold(): RainThresholdState {
  const api = useIotApi()
  const [threshold, setThreshold] = useState<number>(DEFAULT_RAIN_THRESHOLD)

  useEffect(() => {
    let cancelled = false
    api
      .getRainThreshold()
      .then((value) => !cancelled && setThreshold(value))
      .catch(() => toast('Không tải được ngưỡng độ mưa', 'error'))
    return () => {
      cancelled = true
    }
  }, [api])

  const save = useCallback(
    async (value: number): Promise<boolean> => {
      try {
        setThreshold(await api.updateRainThreshold(value))
        toast(`Đã lưu ngưỡng độ mưa: ${value}%`, 'success')
        return true
      } catch (error) {
        toast(isApiError(error) ? error.message : 'Không lưu được ngưỡng độ mưa', 'error')
        return false
      }
    },
    [api],
  )

  return { threshold, save }
}
