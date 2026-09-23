import type { ReactNode } from 'react'

/**
 * Centered modal shell (Stitch edit-profile pattern): overlay + panel with
 * header (title + close) / scrollable body / footer action row.
 */
export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-on-background/40 transition-opacity" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 flex max-h-[calc(100vh-4rem)] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant p-6">
          <h2 className="font-title-sm text-title-sm text-on-background">{title}</h2>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <div className="flex items-center justify-end gap-3 rounded-b-xl border-t border-outline-variant bg-surface-container-lowest p-6">{footer}</div>
      </div>
    </div>
  )
}
