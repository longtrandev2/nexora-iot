/** Rows-per-page choices offered in the table footer. */
const LIMIT_OPTIONS = [10, 20, 30, 50]

/**
 * Table footer pagination: rows-per-page select (optional) +
 * "Hiển thị x-y trên tổng số z bản ghi" + prev / numbered window / next buttons.
 */
export function Pagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  limitOptions = LIMIT_OPTIONS,
  unitWord = 'bản ghi',
}: {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
  /** Present → renders the select; caller should reset page to 1 on change. */
  onLimitChange?: (limit: number) => void
  limitOptions?: number[]
  unitWord?: string
}) {
  const pageCount = Math.max(1, Math.ceil(total / limit))
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  // Window: first, last, and current±1; gaps become "…" markers.
  const visible = new Set<number>([1, pageCount])
  for (let p = page - 1; p <= page + 1; p++) {
    if (p >= 1 && p <= pageCount) visible.add(p)
  }
  const sorted = [...visible].sort((a, b) => a - b)

  const cells: Array<{ key: string; node: React.ReactNode }> = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) cells.push({ key: `gap-${p}`, node: <span className="text-outline">…</span> })
    cells.push({
      key: `page-${p}`,
      node: (
        <button
          type="button"
          onClick={() => onPageChange(p)}
          disabled={p === page}
          className={`flex h-8 w-8 items-center justify-center rounded-lg font-title-sm text-title-sm transition-colors ${
            p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
          }`}
        >
          {p}
        </button>
      ),
    })
    prev = p
  }

  return (
    <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest px-6 py-4">
      <div className="flex flex-wrap items-center gap-4">
        {onLimitChange && (
          <label className="flex cursor-pointer items-center gap-2 font-body-md text-body-md text-on-surface-variant">
            Số hàng/trang
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="cursor-pointer rounded-lg border border-outline-variant bg-surface-container-low px-2 py-1.5 font-title-sm text-title-sm text-on-surface focus:border-primary focus:outline-none"
            >
              {limitOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
        <span className="font-body-md text-body-md text-on-surface-variant">
          Hiển thị {from}-{to} trên tổng số {total.toLocaleString('vi-VN')} {unitWord}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Trang trước"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-outline-variant p-2 text-outline transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
        </button>
        {cells.map((cell) => (
          <span key={cell.key}>{cell.node}</span>
        ))}
        <button
          type="button"
          aria-label="Trang sau"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-outline-variant p-2 text-outline transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  )
}
