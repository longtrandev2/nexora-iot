import type { ToggleAction } from '@/types/iot'

interface DeviceAllControlsProps {
  busy: boolean
  refreshing: boolean
  onAll: (action: ToggleAction) => void
  onRefresh: () => void
}

/** Header action row: bulk on/off (E-1 single `{all}` command) + Làm mới. */
export function DeviceAllControls({ busy, refreshing, onAll, onRefresh }: DeviceAllControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => onAll('on')}
        className="rounded-lg bg-primary px-4 py-2 font-title-sm text-title-sm text-on-primary transition-all hover:shadow-card-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Bật tất cả
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onAll('off')}
        className="rounded-lg border border-outline-variant bg-surface px-4 py-2 font-title-sm text-title-sm text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
      >
        Tắt tất cả
      </button>
      <button
        type="button"
        disabled={refreshing}
        onClick={onRefresh}
        className="flex items-center gap-2 rounded-lg border border-primary/20 bg-secondary-container/10 px-4 py-2 font-title-sm text-title-sm text-primary transition-colors hover:bg-secondary-container/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={`material-symbols-outlined text-[20px] ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
        Làm mới
      </button>
    </div>
  )
}
