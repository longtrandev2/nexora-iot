import { useEffect, useMemo, useState } from 'react'
import { SensorHistoryTable } from '@/components/history/sensor-history-table'
import { FilterBar, FilterSelect, FilterText } from '@/components/ui/filter-controls'
import type { FilterOption } from '@/components/ui/filter-controls'
import { PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { usePagedFetch } from '@/hooks/use-paged-fetch'
import { useIotApi } from '@/services/iot-api-context'
import type { SensorHistoryQuery, SensorInfo, SensorReading, SensorSearchKind } from '@/types/iot'

const PAGE_LIMIT = 20

const KIND_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'temp', label: 'Nhiệt độ' },
  { value: 'humid', label: 'Độ ẩm' },
  { value: 'light', label: 'Ánh sáng' },
  { value: 'time', label: 'Thời gian' },
]

/** Lịch sử cảm biến (UC04/API-07): search toàn log theo loại giá trị + phân trang. */
export function SensorHistoryPage() {
  const api = useIotApi()
  const [sensors, setSensors] = useState<SensorInfo[]>([])
  // UI search state (chỉ apply khi bấm "Tìm kiếm")
  const [kind, setKind] = useState<SensorSearchKind>('all')
  const [term, setTerm] = useState('')
  const [applied, setApplied] = useState<{ kind: SensorSearchKind; term: string }>({ kind: 'all', term: '' })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(PAGE_LIMIT)

  useEffect(() => {
    api.getSensors().then(setSensors).catch(() => setSensors([]))
  }, [api])

  const query = useMemo<SensorHistoryQuery>(
    () => ({ page, limit, search: applied.term, search_kind: applied.kind }),
    [page, limit, applied],
  )
  const { rows, total, loading } = usePagedFetch<SensorReading, SensorHistoryQuery>((q) => api.getSensorHistory(q), query)

  const search = (): void => {
    setApplied({ kind, term })
    setPage(1)
  }

  const changeLimit = (n: number): void => {
    setLimit(n)
    setPage(1)
  }

  return (
    <>
      <PageHeader title="Lịch sử cảm biến" subtitle="Tra cứu dữ liệu cảm biến theo thời gian." />

      <FilterBar>
        <FilterText
          label="GIÁ TRỊ TÌM KIẾM"
          value={term}
          onChange={setTerm}
          placeholder="Ví dụ: 25, 14:30, 2026-09-23..."
          className="flex-1 min-w-[240px]"
        />
        <FilterSelect
          label="LOẠI GIÁ TRỊ"
          value={kind}
          onChange={(v) => setKind(v as SensorSearchKind)}
          options={KIND_OPTIONS}
        />
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={search}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-container px-6 py-2 font-title-sm text-title-sm text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
            Tìm kiếm
          </button>
        </div>
      </FilterBar>

      <div className={`overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm transition-opacity ${loading ? 'opacity-40' : ''}`}>
        <SensorHistoryTable rows={rows} sensors={sensors} />
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} onLimitChange={changeLimit} />
      </div>
    </>
  )
}
