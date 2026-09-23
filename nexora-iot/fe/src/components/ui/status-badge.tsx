/**
 * Pill badge with leading dot (sensor status + device status variants).
 * Labels come from callers; tones map to the Stitch chip palettes.
 */
export type BadgeTone = 'normal' | 'high' | 'none' | 'on' | 'off' | 'loading'

const TONE_CLASSES: Record<BadgeTone, { pill: string; dot: string }> = {
  normal: { pill: 'bg-surface-container-high text-primary', dot: 'bg-primary' },
  high: { pill: 'bg-error-container text-on-error-container', dot: 'bg-error' },
  none: { pill: 'border border-outline-variant bg-surface-container-low text-on-surface-variant', dot: 'bg-outline' },
  on: { pill: 'bg-primary/10 text-primary', dot: 'bg-primary animate-pulse' },
  off: { pill: 'bg-surface-container text-on-surface-variant', dot: 'bg-outline-variant' },
  loading: { pill: 'bg-tertiary-container/20 text-tertiary', dot: 'bg-tertiary animate-pulse' },
}

export function StatusBadge({ tone, label }: { tone: BadgeTone; label: string }) {
  const style = TONE_CLASSES[tone]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  )
}
