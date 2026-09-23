import type { DeviceStatus, ToggleAction } from '@/types/iot'

/**
 * Single mapping for on/off history derived columns (risk note in phase 05):
 * action chip, status chip, "Kết quả" and "Trạng thái cuối" are ALL derived
 * from DeviceAction.action + DeviceAction.status here.
 */

export const ACTION_VIEW: Record<ToggleAction, { label: string; classes: string }> = {
  on: { label: 'Bật', classes: 'bg-primary/10 text-primary' },
  off: { label: 'Tắt', classes: 'bg-surface-container-high text-on-surface-variant' },
}

export const DEVICE_STATUS_VIEW: Record<DeviceStatus, { label: string; classes: string; dot: string; spinning?: boolean }> = {
  on: { label: 'On', classes: 'bg-primary/10 text-primary', dot: 'bg-primary animate-pulse' },
  off: { label: 'Off', classes: 'bg-surface-container text-on-surface-variant', dot: 'bg-outline-variant' },
  loading: { label: 'Loading', classes: 'bg-tertiary-container/20 text-tertiary', dot: '', spinning: true },
}

/** Kết quả: confirmed status → Thành công, still loading → Đang xử lý. */
export function resultView(status: DeviceStatus): { label: string; icon: string; classes: string } {
  return status === 'loading'
    ? { label: 'Đang xử lý', icon: 'pending', classes: 'text-on-surface-variant' }
    : { label: 'Thành công', icon: 'check_circle', classes: 'text-secondary' }
}

/** Trạng thái cuối: confirmed → Hoàn tất, still loading → Chờ. */
export function finalStatusView(status: DeviceStatus): { label: string; classes: string } {
  return status === 'loading'
    ? { label: 'Chờ', classes: 'bg-surface-container text-on-surface-variant' }
    : { label: 'Hoàn tất', classes: 'bg-secondary-container/20 text-secondary' }
}
