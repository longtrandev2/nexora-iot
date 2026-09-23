import type { ReactNode } from 'react'

/** Shared input chrome for every filter control (Stitch filter-bar look). */
export const FILTER_INPUT_CLASSES =
  'w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 font-body-md text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary'

/** Labeled field wrapper for filter bars. */
export function FilterField({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`w-full sm:w-auto ${className}`}>
      <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">{label}</label>
      {children}
    </div>
  )
}

/** Filter bar card wrapping a row of filter fields + action buttons. */
export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-stack-lg flex flex-wrap items-end gap-4 rounded-xl border border-outline-variant bg-surface p-4 shadow-sm">
      {children}
    </div>
  )
}

export interface FilterOption {
  value: string
  label: string
}

/** Label + styled select with expand_more affordance. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className = 'min-w-[180px]',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  className?: string
}) {
  return (
    <FilterField label={label} className={className}>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${FILTER_INPUT_CLASSES} cursor-pointer appearance-none pr-9`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
          expand_more
        </span>
      </div>
    </FilterField>
  )
}

/** Label + search text input with leading icon. */
export function FilterText({
  label,
  value,
  onChange,
  placeholder,
  className = 'flex-1 min-w-[200px]',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <FilterField label={label} className={className}>
      <div className="relative">
        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${FILTER_INPUT_CLASSES} pl-10`}
        />
      </div>
    </FilterField>
  )
}

/** From/to datetime-local pair under one label (spec "yyyy-MM-dd HH:mm:ss"). */
export function FilterDatetime({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}) {
  return (
    <FilterField label="KHOẢNG THỜI GIAN (dd/mm/yyyy hh:mm:ss)" className="min-w-[340px]">
      <div className="flex gap-2">
        <input
          type="datetime-local"
          step={1}
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className={FILTER_INPUT_CLASSES}
          aria-label="Từ"
        />
        <input
          type="datetime-local"
          step={1}
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className={FILTER_INPUT_CLASSES}
          aria-label="Đến"
        />
      </div>
    </FilterField>
  )
}
