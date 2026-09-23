import { useEffect, useMemo, useState } from 'react'
import { SensorHistoryTable } from '@/components/history/sensor-history-table'
import { FilterBar, FilterDatetime, FilterSelect, FilterText } from '@/components/ui/filter-controls'
import { PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { usePagedFetch } from '@/hooks/use-paged-fetch'
import { useIotApi } from '@/services/iot-api-context'
import { fromDatetimeLocal } from '@/utils/format-datetime'
import { sensorStatus } from '@/utils/sensor-styling'
import type { SensorHistoryQuery, SensorInfo, SensorReading } from '@/types/iot'

const PAGE_LIMIT = 20
const RANGE_ERROR = 'Thời gian bắt đầu phải trước thời gian kết thúc'

/** Lịch sử cảm biến (UC04/API-07): server-side filters + pagination. */
export function SensorHistoryPage() {
  const api = useIotApi()
  const [sensors, setSensors] = useState<SensorInfo[]>([])
  // UI filter state (applied on "Lọc dữ liệu")
  const [search, setSearch] = useState('')
  const [sensor, setSensor] = useState('')
  const [status, setStatus] = useState('')
  const [fromLocal, setFromLocal] = useState('')
  const [toLocal, setToLocal] = useState('')
  const [applied, setApplied] = useState({ sensor: '', status: '', search: '', from: '', to: '' })
  const [page, setPage] = useState(1)

  useEffect(() => {
    api.getSensors().then(setSensors).catch(() => setSensors([]))
  }, [api])

  const rangeInvalid = useMemo(
    () => Boolean(fromLocal && toLocal && fromLocal > toLocal),
    [fromLocal, toLocal],
  )

  const query = useMemo<SensorHistoryQuery>(
    () => ({
      sensors_id: applied.sensor ? Number(applied.sensor) : undefined,
      from: fromDatetimeLocal(applied.from),
      to: fromDatetimeLocal(applied.to),
      page,
      limit: PAGE_LIMIT,
    }),
    [applied, page],
  )
  const { rows, total, loading } = usePagedFetch<SensorReading, SensorHistoryQuery>((q) => api.getSensorHistory(q), query)

  // Client-side filters (YAGNI decision): text search + FE-computed status.
  const visible = useMemo(() => {
    const needle = applied.search.trim().toLowerCase()
    return rows.filter((row) => {
      const name = sensors.find((s) => s.sensors_id === row.sensors_id)?.sensors_name ?? ''
      if (needle && !`${row.id}`.includes(needle) && !name.toLowerCase().includes(needle)) return false
      if (applied.status) {
        const tone = sensorStatus(row.sensors_id, row.value).tone
        if (tone !== applied.status) return false
      }
      return true
    })
  }, [rows, applied, sensors])

  const applyFilters = (): void => {
    if (rangeInvalid) return
    setApplied({ sensor, status, search, from: fromLocal, to: toLocal })
    setPage(1)
  }

  const resetFilters = (): void => {
    setSearch('')
    setSensor('')
    setStatus('')
    setFromLocal('')
    setToLocal('')
    setApplied({ sensor: '', status: '', search: '', from: '', to: '' })
    setPage(1)
  }

  return (
    <>
      <PageHeader title="Lịch sử cảm biến" subtitle="Tra cứu dữ liệu cảm biến theo thời gian." />

      <FilterBar>
        <FilterText label="TÌM KIẾM THEO ID/TÊN" value={search} onChange={setSearch} placeholder="Ví dụ: 1048, Nhiệt độ..." />
        <FilterSelect
          label="LOẠI CẢM BIẾN"
          value={sensor}
          onChange={setSensor}
          options={[{ value: '', label: 'Tất cả các loại' }, ...sensors.map((s) => ({ value: String(s.sensors_id), label: s.sensors_name }))]}
        />
        <FilterDatetime from={fromLocal} to={toLocal} onFromChange={setFromLocal} onToChange={setToLocal} />
        <FilterSelect
          label="TRẠNG THÁI"
          value={status}
          onChange={setStatus}
          options={[
            { value: '', label: 'Tất cả' },
            { value: 'normal', label: 'Bình thường' },
            { value: 'high', label: 'Cao' },
            { value: 'none', label: 'Không có dữ liệu' },
          ]}
        />
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={applyFilters}
            disabled={rangeInvalid}
            className="rounded-lg bg-gradient-to-r from-primary to-primary-container px-6 py-2 font-title-sm text-title-sm text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Lọc dữ liệu
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-outline-variant px-4 py-2 font-title-sm text-title-sm text-primary transition-colors hover:bg-surface-container-high"
          >
            Đặt lại
          </button>
        </div>
      </FilterBar>
      {rangeInvalid ? <p className="mb-2 font-body-md text-body-md text-error">{RANGE_ERROR}</p> : null}

      <div className={`overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm transition-opacity ${loading ? 'opacity-40' : ''}`}>
        <SensorHistoryTable rows={visible} sensors={sensors} />
        <Pagination page={page} limit={PAGE_LIMIT} total={total} onPageChange={setPage} />
      </div>
    </>
  )
}
