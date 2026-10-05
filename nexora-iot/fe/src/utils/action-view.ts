import type { ActionStatus, ToggleAction } from '@/types/iot'

/**
 * Single mapping for on/off history derived columns (risk note in phase 05):
 * action chip + trạng thái thực thi are derived from DeviceAction.action/status here.
 */

export const ACTION_VIEW: Record<ToggleAction, { label: string; classes: string }> = {
  on: { label: 'Bật', classes: 'bg-primary/10 text-primary' },
  off: { label: 'Tắt', classes: 'bg-surface-container-high text-on-surface-variant' },
}

/** Trạng thái thực thi lệnh: success/failed/loading (E-2, API-10). */
export const ACTION_STATUS_VIEW: Record<ActionStatus, { label: string; icon: string; classes: string; spin?: boolean }> = {
  success: { label: 'Thành công', icon: 'check_circle', classes: 'text-secondary' },
  failed: { label: 'Thất bại', icon: 'cancel', classes: 'text-error' },
  loading: { label: 'Đang xử lý', icon: 'progress_activity', classes: 'text-on-surface-variant', spin: true },
}
