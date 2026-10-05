import { Outlet } from 'react-router-dom'
import { SideNavBar } from './side-nav-bar'

/**
 * Authenticated app frame: fixed sidebar (280px) only — no top bar (yêu cầu UI).
 * <main> is the ONLY scroll container (body never scrolls) so pages like
 * the dashboard can opt into "fit one viewport" via h-full.
 */
export function AppShell() {
  return (
    <div className="h-dvh overflow-hidden bg-background font-body-md text-on-background selection:bg-primary-container selection:text-on-primary-container">
      <SideNavBar />
      <main className="mx-auto ml-[280px] h-dvh max-w-[1600px] overflow-y-auto p-container-padding">
        <Outlet />
      </main>
    </div>
  )
}
