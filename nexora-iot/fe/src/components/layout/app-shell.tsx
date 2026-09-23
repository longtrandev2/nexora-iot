import { Outlet } from 'react-router-dom'
import { SideNavBar } from './side-nav-bar'
import { TopNavBar } from './top-nav-bar'

/**
 * Authenticated app frame: fixed sidebar (280px) + fixed header (72px),
 * routed page content flows in <Outlet /> (dashboard.html main canvas).
 */
export function AppShell() {
  return (
    <div className="min-h-screen bg-background font-body-md text-on-background selection:bg-primary-container selection:text-on-primary-container">
      <SideNavBar />
      <TopNavBar />
      <main className="mx-auto ml-[280px] mt-[72px] max-w-[1600px] p-container-padding pb-20">
        <Outlet />
      </main>
    </div>
  )
}
