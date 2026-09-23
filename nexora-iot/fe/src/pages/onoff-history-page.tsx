import { useEffect, useMemo, useState } from 'react'
import { DeviceHistoryTable } from '@/components/history/device-history-table'
import { FilterBar, FilterDatetime, FilterSelect, FilterText } from '@/components/ui/filter-controls'
import { PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { usePagedFetch } from '@/hooks/use-paged-fetch'
import { useIotApi } from '@/services/iot-api-context'
import { fromDatetimeLocal } from '@/utils/format-datetime'
import type { Device, DeviceAction, DeviceHistoryQuery } from '@/types/iot'

const PAGE_LIMIT = 20
const RANGE_ERROR = 'Thời gian bắt đầu phải trước thời gian kết thúc'

/** Lịch sử bật/tắt (UC05/API-10): server-side filters + derived columns. */
export function OnoffHistoryPage() {
  const api = useIotApi()
  const [devices, setDevices] = useState<Device[]>([])
  const [search, setSearch] = useState('')
  const [device, setDevice] = useState('')
  const [action, setAction] = useState('')
  const [status, setStatus] = useState('')
  const [fromLocal, setFromLocal] = useState('')
  const [toLocal, setToLocal] = useState('')
  const [applied, setApplied] = useState({ search: '', device: '', action: '', status: '', from: '', to: '' })
  const [page, setPage] = useState(1)

  useEffect(() => {
    api.getDevices().then(setDevices).catch(() => setDevices([]))
  }, [api])

  const rangeInvalid = useMemo(
    () => Boolean(fromLocal && toLocal && fromLocal > toLocal),
    [fromLocal, toLocal],
  )

  const query = useMemo<DeviceHistoryQuery>(
    () => ({
      device_id: applied.device ? Number(applied.device) : undefined,
      action: applied.action ? (applied.action as DeviceHistoryQuery['action']) : undefined,
      status: applied.status ? (applied.status as DeviceHistoryQuery['status']) : undefined,
      from: fromDatetimeLocal(applied.from),
      to: fromDatetimeLocal(applied.to),
      page,
      limit: PAGE_LIMIT,
    }),
    [applied, page],
  )
  const { rows, total, loading } = usePagedFetch<DeviceAction, DeviceHistoryQuery>((q) => api.getDeviceHistory(q), query)

  // Client-side text search on the fetched page (name/user, YAGNI decision).
  const visible = useMemo(() => {
    const needle = applied.search.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter(
      (row) => row.devices_name.toLowerCase().includes(needle) || row.user_name.toLowerCase().includes(needle),
    )
  }, [rows, applied])

  const applyFilters = (): void => {
    if (rangeInvalid) return
    setApplied({ search, device, action, status, from: fromLocal, to: toLocal })
    setPage(1)
  }

  const resetFilters = (): void => {
    setSearch('')
    setDevice('')
    setAction('')
    setStatus('')
    setFromLocal('')
    setToLocal('')
    setApplied({ search: '', device: '', action: '', status: '', from: '', to: '' })
    setPage(1)
  }

  return (
    <>
      <PageHeader title="Lịch sử bật/tắt" subtitle="Theo dõi các lần thay đổi trạng thái của đèn LED." />

      <FilterBar>
        <FilterText label="TÌM THEO TÊN" value={search} onChange={setSearch} placeholder="Nhập tên thiết bị..." />
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
            { value: 'on', label: 'On' },
            { value: 'off', label: 'Off' },
            { value: 'loading', label: 'Loading' },
          ]}
          className="min-w-[130px]"
        />
        <FilterDatetime from={fromLocal} to={toLocal} onFromChange={setFromLocal} onToChange={setToLocal} />
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={applyFilters}
            disabled={rangeInvalid}
            className="rounded-lg bg-primary px-6 py-2 font-body-md font-semibold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Áp dụng
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-outline-variant px-4 py-2 font-body-md text-body-md text-primary transition-colors hover:bg-surface-container-high"
          >
            Đặt lại
          </button>
        </div>
      </FilterBar>
      {rangeInvalid ? <p className="mb-2 font-body-md text-body-md text-error">{RANGE_ERROR}</p> : null}

      <div className={`overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-opacity ${loading ? 'opacity-40' : ''}`}>
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface/50 p-container-padding">
          <h3 className="font-title-sm text-title-sm text-on-background">Chi tiết giao dịch</h3>
        </div>
        <DeviceHistoryTable rows={visible} />
        <Pagination page={page} limit={PAGE_LIMIT} total={total} onPageChange={setPage} unitWord="mục" />
      </div>
    </>
  )
}
