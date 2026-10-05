import { useEffect, useMemo, useState } from 'react'
import { DeviceHistoryTable } from '@/components/history/device-history-table'
import { FilterBar, FilterSelect, FilterText } from '@/components/ui/filter-controls'
import { PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { usePagedFetch } from '@/hooks/use-paged-fetch'
import { useIotApi } from '@/services/iot-api-context'
import type { Device, DeviceAction, DeviceHistoryQuery } from '@/types/iot'

const PAGE_LIMIT = 20

/** Lịch sử bật/tắt (UC05/API-10): search thời gian toàn log + filters + pagination. */
export function OnoffHistoryPage() {
  const api = useIotApi()
  const [devices, setDevices] = useState<Device[]>([])
  // UI state (chỉ apply khi bấm "Tìm kiếm")
  const [search, setSearch] = useState('')
  const [device, setDevice] = useState('')
  const [action, setAction] = useState('')
  const [status, setStatus] = useState('')
  const [applied, setApplied] = useState({ search: '', device: '', action: '', status: '' })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(PAGE_LIMIT)

  useEffect(() => {
    api.getDevices().then(setDevices).catch(() => setDevices([]))
  }, [api])

  const query = useMemo<DeviceHistoryQuery>(
    () => ({
      device_id: applied.device ? Number(applied.device) : undefined,
      action: applied.action ? (applied.action as DeviceHistoryQuery['action']) : undefined,
      status: applied.status ? (applied.status as DeviceHistoryQuery['status']) : undefined,
      search: applied.search,
      page,
      limit,
    }),
    [applied, page, limit],
  )
  const { rows, total, loading } = usePagedFetch<DeviceAction, DeviceHistoryQuery>((q) => api.getDeviceHistory(q), query)

  const searchAll = (): void => {
    setApplied({ search, device, action, status })
    setPage(1)
  }

  const changeLimit = (n: number): void => {
    setLimit(n)
    setPage(1)
  }

  return (
    <>
      <PageHeader title="Lịch sử bật/tắt" subtitle="Theo dõi các lần thay đổi trạng thái của đèn LED." />

      <FilterBar>
        <FilterText
          label="TÌM KIẾM THỜI GIAN"
          value={search}
          onChange={setSearch}
          placeholder="Ví dụ: 2026, 2026/09, 14:30..."
          className="flex-1 min-w-[240px]"
        />
        <FilterSelect
          label="THIẾT BỊ"
          value={device}
          onChange={setDevice}
          options={[{ value: '', label: 'Tất cả' }, ...devices.map((d) => ({ value: String(d.devices_id), label: d.devices_name }))]}
          className="min-w-[160px]"
        />
        <FilterSelect
          label="HÀNH ĐỘNG"
          value={action}
          onChange={setAction}
          options={[
            { value: '', label: 'Tất cả' },
            { value: 'on', label: 'Bật' },
            { value: 'off', label: 'Tắt' },
          ]}
          className="min-w-[130px]"
        />
        <FilterSelect
          label="TRẠNG THÁI"
          value={status}
          onChange={setStatus}
          options={[
            { value: '', label: 'Tất cả' },
            { value: 'success', label: 'Thành công' },
            { value: 'failed', label: 'Thất bại' },
            { value: 'loading', label: 'Đang xử lý' },
          ]}
          className="min-w-[130px]"
        />
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={searchAll}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-container px-6 py-2 font-title-sm text-title-sm text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
            Tìm kiếm
          </button>
        </div>
      </FilterBar>

      <div className={`overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-opacity ${loading ? 'opacity-40' : ''}`}>
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface/50 p-container-padding">
          <h3 className="font-title-sm text-title-sm text-on-background">Chi tiết hoạt động</h3>
        </div>
        <DeviceHistoryTable rows={rows} />
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} onLimitChange={changeLimit} unitWord="mục" />
      </div>
    </>
  )
}
