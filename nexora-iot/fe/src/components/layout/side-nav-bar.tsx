import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/auth-context'
import { NAV_ITEMS } from '@/config/nav'

/**
 * Fixed 280px sidebar per dashboard.html: brand block, nav items with
 * active state (border-l-4 primary + secondary-container/20), logout footer.
 */
const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 font-title-sm text-title-sm transition-colors duration-200 ${
    isActive
      ? 'border-primary bg-secondary-container/20 text-primary'
      : 'border-transparent text-on-surface-variant hover:bg-surface-container-high'
  }`

export function SideNavBar() {
  const { logout } = useAuth()

  const handleLogout = (): void => {
    void logout() // guard redirects to /login once user clears
  }

  return (
    <nav className="custom-scrollbar fixed left-0 top-0 z-20 flex h-screen w-sidebar-width flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-highest py-stack-lg">
      {/* Brand header */}
      <div className="mb-stack-lg flex items-center gap-3 px-container-padding">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
          <span className="material-symbols-outlined" data-weight="fill">
            hub
          </span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md text-primary">NEXORA IoT</h1>
          <p className="font-label-caps uppercase text-label-caps tracking-wider text-on-surface-variant">
            Hệ thống giám sát
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <ul className="flex flex-1 flex-col space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === '/'} className={navLinkClass}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer: logout */}
      <div className="mt-auto px-3 pt-stack-sm">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-title-sm text-title-sm text-error transition-colors duration-200 hover:bg-error-container/50"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </nav>
  )
}
