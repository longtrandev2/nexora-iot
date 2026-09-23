import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/auth-context'
import { AppShell } from '@/components/layout/app-shell'

/**
 * Layout route guard: waits for session restore, bounces unauthenticated
 * visitors to /login (remembering where they were headed), otherwise renders
 * the app shell with the nested page <Outlet />.
 */
export function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined animate-pulse text-[40px]">hub</span>
          <p className="font-body-lg text-body-lg">Đang tải phiên làm việc...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <AppShell />
}
