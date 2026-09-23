import { useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/auth-context'
import { findNavItem } from '@/config/nav'

/**
 * Fixed 72px header with backdrop blur. Search + notifications are omitted
 * (decorative in the design — locked plan decision); current page title on
 * the left, logged-in user chip on the right.
 */
export function TopNavBar() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const item = findNavItem(pathname)
  const initials =
    user?.fullname
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((word) => word[0]?.toUpperCase())
      .join('') ?? '?'

  return (
    <header className="fixed right-0 top-0 z-10 flex h-header-height w-[calc(100%-280px)] items-center justify-between border-b border-outline-variant bg-surface/80 px-container-padding backdrop-blur-md">
      <div className="font-title-sm text-title-sm text-on-surface-variant">{item.label}</div>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-label-caps text-label-caps text-primary">
          {initials}
        </div>
        <div className="hidden sm:block">
          <p className="font-title-sm text-title-sm text-on-surface">{user?.fullname ?? '—'}</p>
          <p className="font-label-caps uppercase text-label-caps text-on-surface-variant">
            {user?.username ?? ''}
          </p>
        </div>
      </div>
    </header>
  )
}
