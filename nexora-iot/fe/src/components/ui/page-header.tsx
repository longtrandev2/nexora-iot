import type { ReactNode } from 'react'

/** Standard page header: headline-lg title + body-lg subtitle (Stitch pattern). */
export function PageHeader({
  title,
  subtitle,
  actions,
  compact = false,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  /** No bottom margin — for pages that must fit one viewport (dashboard). */
  compact?: boolean
}) {
  return (
    <div className={compact ? '' : 'mb-stack-lg'}>
      <div className="flex flex-wrap items-start justify-between gap-stack-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">{title}</h2>
          {subtitle ? <p className="mt-1 font-body-lg text-body-lg text-on-surface-variant">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
    </div>
  )
}
