import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

/**
 * Small gear button on the "Độ mưa" card → popover with a 0..100 input to set
 * the warning threshold (card blinks when rain ≥ threshold).
 */
export function RainThresholdSetting({
  threshold,
  onSave,
}: {
  threshold: number
  onSave: (value: number) => Promise<boolean>
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(String(threshold))
  const [saving, setSaving] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside the popover.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent): void => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const value = Number(draft)
  const valid = draft.trim() !== '' && Number.isInteger(value) && value >= 0 && value <= 100

  const toggle = (): void => {
    if (!open) setDraft(String(threshold)) // start from the saved value each time
    setOpen(!open)
  }

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (!valid || saving) return
    setSaving(true)
    const ok = await onSave(value)
    setSaving(false)
    if (ok) setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        title={`Ngưỡng cảnh báo: ${threshold}%`}
        aria-label="Cài đặt ngưỡng độ mưa"
        aria-expanded={open}
        className="flex items-center gap-1 rounded-md px-1.5 py-1 font-label-caps text-label-caps text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
      >
        <span className="material-symbols-outlined text-[18px]">settings</span>≥{threshold}%
      </button>
      {open && (
        <form
          onSubmit={submit}
          className="absolute right-0 top-full z-30 mt-1 w-56 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 shadow-lg"
        >
          <label htmlFor="rain-threshold-input" className="mb-1 block font-label-caps text-label-caps text-on-surface-variant">
            NGƯỠNG CẢNH BÁO (%)
          </label>
          <div className="flex gap-2">
            <input
              id="rain-threshold-input"
              type="number"
              min={0}
              max={100}
              step={1}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full rounded-md border border-outline-variant bg-surface-container-low px-2 py-1 font-body-md text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!valid || saving}
              className="rounded-md bg-primary px-3 py-1 font-label-caps text-label-caps text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              LƯU
            </button>
          </div>
          {!valid && <p className="mt-1 font-body-md text-xs text-error">Nhập số nguyên từ 0 đến 100</p>}
        </form>
      )}
    </div>
  )
}
