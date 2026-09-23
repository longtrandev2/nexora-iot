import { useEffect, useState, type ReactNode } from 'react'

/**
 * Tiny event-bus toast: any module calls toast(message, tone) — no context
 * plumbing. <ToastProvider> (mounted once in main.tsx) owns state + viewport.
 */
export type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

const TOAST_EVENT = 'nexora:toast'
const TOAST_DURATION_MS = 3500
let nextToastId = 1

/** Fire a toast from anywhere (pages, hooks, adapters' callers). */
export function toast(message: string, tone: ToastTone = 'info'): void {
  window.dispatchEvent(new CustomEvent<{ message: string; tone: ToastTone }>(TOAST_EVENT, { detail: { message, tone } }))
}

const TONE_STYLES: Record<ToastTone, { icon: string; classes: string }> = {
  success: { icon: 'check_circle', classes: 'border-l-[#10B981] text-[#10B981]' },
  error: { icon: 'error', classes: 'border-l-error text-error' },
  info: { icon: 'info', classes: 'border-l-primary text-primary' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const onToast = (event: Event): void => {
      const detail = (event as CustomEvent<{ message: string; tone: ToastTone }>).detail
      const id = nextToastId++
      setToasts((prev) => [...prev.slice(-3), { id, ...detail }])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_DURATION_MS)
    }
    window.addEventListener(TOAST_EVENT, onToast)
    return () => window.removeEventListener(TOAST_EVENT, onToast)
  }, [])

  return (
    <>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((item) => {
          const tone = TONE_STYLES[item.tone]
          return (
            <div
              key={item.id}
              className={`flex items-center gap-2 rounded-lg border border-outline-variant border-l-4 bg-surface-container-lowest px-4 py-3 font-body-md text-body-lg text-on-background shadow-card-hover ${tone.classes}`}
            >
              <span className="material-symbols-outlined text-[20px]">{tone.icon}</span>
              <span>{item.message}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}
